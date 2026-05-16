import { NextResponse } from "next/server"
import { isValseaConfigured, requireValseaApiKey } from "@/lib/valsea/config"
import { translateText } from "@/services/valsea.service"
import type { SupportedLanguage } from "@/types"

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
    const { text, target, source } = body as {
      text?: string
      target?: SupportedLanguage
      source?: SupportedLanguage | "auto"
    }

    if (!text?.trim()) {
      return NextResponse.json(
        { success: false, error: "Text is required" },
        { status: 400 }
      )
    }

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Target language is required" },
        { status: 400 }
      )
    }

    const result = await translateText(text, target, source ?? "auto")

    return NextResponse.json({
      success: true,
      data: {
        translatedText: result.translatedText,
        sourceLanguage: result.sourceLanguage,
        targetLanguage: result.targetLanguage,
      },
    })
  } catch (error) {
    console.error("[valsea/translate]", error)
    const message =
      error instanceof Error ? error.message : "Translation failed"
    const status = message.toLowerCase().includes("not set") ? 503 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
