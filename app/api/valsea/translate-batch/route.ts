import { NextResponse } from "next/server"
import { isValseaConfigured, requireValseaApiKey } from "@/lib/valsea/config"
import { isValseaTranslateSupported } from "@/lib/valsea/translate-languages"
import { translateTextsWithOpenAI } from "@/services/openai-translate.service"
import { translateText } from "@/services/valsea.service"
import type { SupportedLanguage } from "@/types"

/** Vercel hobby = 10s; keep batches small enough to finish in one invocation. */
export const maxDuration = 60

const MAX_ITEMS = 80
const MAX_CHARS = 4000
const CONCURRENCY = 6

function isCriticalValseaError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  const m = err.message.toLowerCase()
  return (
    m.includes("valsea_api_key") ||
    m.includes("api key") ||
    m.includes("unauthorized") ||
    m.includes("401") ||
    m.includes("402") ||
    m.includes("credits") ||
    m.includes("not set") ||
    m.includes("invalid or expired")
  )
}

async function translateOne(
  text: string,
  target: SupportedLanguage,
  source: SupportedLanguage | "auto"
): Promise<{ text: string; changed: boolean; error?: string }> {
  const trimmed = text?.trim() ?? ""
  if (!trimmed) return { text: text ?? "", changed: false }
  if (trimmed.length > MAX_CHARS) return { text: trimmed, changed: false }

  try {
    const result = await translateText(trimmed, target, source)
    const out = result.translatedText?.trim()
    if (!out) {
      return { text: trimmed, changed: false, error: "Empty translation response" }
    }
    return { text: out, changed: out !== trimmed }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed"
    if (isCriticalValseaError(err)) throw err
    return { text: trimmed, changed: false, error: message }
  }
}

export async function POST(request: Request) {
  try {
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
    const remainder = texts.slice(MAX_ITEMS)

    // Hindi, Sinhala, Korean, Japanese, etc. — Valsea translate API does not support these
    if (!isValseaTranslateSupported(target)) {
      try {
        const translations = await translateTextsWithOpenAI(slice, target, src)
        return NextResponse.json({
          success: true,
          data: { translations: [...translations, ...remainder] },
        })
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Translation failed for this language."
        return NextResponse.json({ success: false, error: message }, { status: 500 })
      }
    }

    if (!isValseaConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "VALSEA_API_KEY is not set on the server. Add it to .env.local and Vercel → Settings → Environment Variables, then redeploy.",
        },
        { status: 503 }
      )
    }

    requireValseaApiKey()

    const translations: string[] = new Array(slice.length)
    let failedCount = 0
    let lastError: string | undefined

    for (let i = 0; i < slice.length; i += CONCURRENCY) {
      const batch = slice.slice(i, i + CONCURRENCY)
      const results = await Promise.all(
        batch.map((text) => translateOne(text, target, src))
      )
      results.forEach((result, batchIndex) => {
        const globalIndex = i + batchIndex
        translations[globalIndex] = result.text
        if (!result.changed) {
          failedCount++
          if (result.error) lastError = result.error
        }
      })
    }

    if (failedCount === slice.length && slice.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            lastError ??
            "Valsea could not translate text. Check VALSEA_API_KEY on Vercel and redeploy.",
        },
        { status: 502 }
      )
    }

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
