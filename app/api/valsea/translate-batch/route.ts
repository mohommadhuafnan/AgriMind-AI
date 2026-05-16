import { NextResponse } from "next/server"
import { isValseaConfigured, requireValseaApiKey } from "@/lib/valsea/config"
import { translateText } from "@/services/valsea.service"
import type { SupportedLanguage } from "@/types"

const MAX_ITEMS = 80
const MAX_CHARS = 4000

function isCriticalValseaError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  const m = err.message.toLowerCase()
  return (
    m.includes("valsea_api_key") ||
    m.includes("api key") ||
    m.includes("invalid") ||
    m.includes("unauthorized") ||
    m.includes("401") ||
    m.includes("402") ||
    m.includes("credits") ||
    m.includes("not set")
  )
}

export async function POST(request: Request) {
  try {
    if (!isValseaConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "VALSEA_API_KEY is not set. Add it to .env.local and restart the server.",
        },
        { status: 503 }
      )
    }

    requireValseaApiKey()

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
    const src = source ?? "auto"
    const CONCURRENCY = 5
    const translations: string[] = []

    async function translateOne(text: string): Promise<string> {
      const trimmed = text?.trim() ?? ""
      if (!trimmed) return text ?? ""
      if (trimmed.length > MAX_CHARS) return trimmed
      const result = await translateText(trimmed, target, src)
      return result.translatedText?.trim() || trimmed
    }

    for (let i = 0; i < slice.length; i += CONCURRENCY) {
      const batch = slice.slice(i, i + CONCURRENCY)
      try {
        const part = await Promise.all(batch.map(translateOne))
        translations.push(...part)
      } catch (err) {
        if (isCriticalValseaError(err)) throw err
        translations.push(...batch)
      }
    }

    return NextResponse.json({
      success: true,
      data: { translations },
    })
  } catch (error) {
    console.error("[valsea/translate-batch]", error)
    const message =
      error instanceof Error ? error.message : "Batch translation failed"
    const status = message.toLowerCase().includes("not set") ? 503 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
