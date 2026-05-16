import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { synthesizeSpeech } from "@/services/openai-tts.service"
import type { SupportedLanguage } from "@/types"

export async function POST(request: Request) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { text } = body as { text?: string; language?: SupportedLanguage }

    if (!text?.trim()) {
      return NextResponse.json(
        { success: false, error: "Text is required" },
        { status: 400 }
      )
    }

    const audio = await synthesizeSpeech(text.trim())

    return new NextResponse(new Uint8Array(audio), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch (error) {
    console.error("[voice/speak]", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Speech synthesis failed",
      },
      { status: 500 }
    )
  }
}
