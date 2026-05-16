import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { translateText } from "@/services/valsea.service"
import type { SupportedLanguage } from "@/types"

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
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Translation failed",
      },
      { status: 500 }
    )
  }
}
