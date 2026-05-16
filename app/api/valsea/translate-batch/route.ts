import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { translateText } from "@/services/valsea.service"
import type { SupportedLanguage } from "@/types"

const MAX_ITEMS = 80
const MAX_CHARS = 4000

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { texts, target, source } = body as {
      texts?: string[]
      target?: SupportedLanguage
      source?: SupportedLanguage | "auto"
    }

    if (!Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json(
        { success: false, error: "texts array is required" },
        { status: 400 }
      )
    }

    if (!target) {
      return NextResponse.json(
        { success: false, error: "target language is required" },
        { status: 400 }
      )
    }

    if (target === "en") {
      return NextResponse.json({
        success: true,
        data: { translations: texts },
      })
    }

    const slice = texts.slice(0, MAX_ITEMS)
    const src = source ?? "en"
    const CONCURRENCY = 5
    const translations: string[] = []

    async function translateOne(text: string): Promise<string> {
      const trimmed = text?.trim() ?? ""
      if (!trimmed) return text ?? ""
      if (trimmed.length > MAX_CHARS) return trimmed
      try {
        const result = await translateText(trimmed, target, src)
        return result.translatedText?.trim() || trimmed
      } catch {
        return trimmed
      }
    }

    for (let i = 0; i < slice.length; i += CONCURRENCY) {
      const batch = slice.slice(i, i + CONCURRENCY)
      const part = await Promise.all(batch.map(translateOne))
      translations.push(...part)
    }

    return NextResponse.json({
      success: true,
      data: { translations },
    })
  } catch (error) {
    console.error("[valsea/translate-batch]", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Batch translation failed",
      },
      { status: 500 }
    )
  }
}
