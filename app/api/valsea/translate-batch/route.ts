import { NextResponse } from "next/server"
import { isValseaConfigured, requireValseaApiKey } from "@/lib/valsea/config"
import { translateText } from "@/services/valsea.service"
import type { SupportedLanguage } from "@/types"

const MAX_ITEMS = 200
const MAX_CHARS = 4000
const CONCURRENCY = 4

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

async function translateOne(
  text: string,
  target: SupportedLanguage,
  source: SupportedLanguage | "auto"
): Promise<string> {
  const trimmed = text?.trim() ?? ""
  if (!trimmed) return text ?? ""
  if (trimmed.length > MAX_CHARS) return trimmed
  const result = await translateText(trimmed, target, source)
  const out = result.translatedText?.trim()
  return out && out !== trimmed ? out : trimmed
}

export async function POST(request: Request) {
  try {
    if (!isValseaConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "VALSEA_API_KEY is not set. Add it to .env.local (and Vercel env) then restart.",
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
    const src = source ?? "en"
    const translations: string[] = new Array(slice.length)
    let failedCount = 0

    for (let i = 0; i < slice.length; i += CONCURRENCY) {
      const batch = slice.slice(i, i + CONCURRENCY)
      const results = await Promise.all(
        batch.map(async (text, batchIndex) => {
          const globalIndex = i + batchIndex
          try {
            const translated = await translateOne(text, target, src)
            if (translated === text.trim()) failedCount++
            return translated
          } catch (err) {
            if (isCriticalValseaError(err)) throw err
            failedCount++
            return text
          }
        })
      )
      results.forEach((t, batchIndex) => {
        translations[i + batchIndex] = t
      })
    }

    if (failedCount === slice.length && slice.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Valsea could not translate text. Check VALSEA_API_KEY and account credits at valsea.ai/dashboard.",
        },
        { status: 502 }
      )
    }

    const remainder = texts.slice(MAX_ITEMS)
    return NextResponse.json({
      success: true,
      data: { translations: [...translations, ...remainder] },
    })
  } catch (error) {
    console.error("[valsea/translate-batch]", error)
    const message =
      error instanceof Error ? error.message : "Batch translation failed"
    const status = message.toLowerCase().includes("not set") ? 503 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
