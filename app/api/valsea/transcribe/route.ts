import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { transcribeAudio } from "@/services/valsea.service"
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

    const formData = await request.formData()
    const file = formData.get("file")
    const rawLang = (formData.get("language") as string) ?? "auto"
    const language =
      rawLang === "auto" ? "auto" : ((rawLang as SupportedLanguage) ?? "en")

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: "Audio file is required" },
        { status: 400 }
      )
    }

    const result = await transcribeAudio(
      file,
      language,
      file instanceof File ? file.name : "recording.webm"
    )

    return NextResponse.json({
      success: true,
      data: {
        text: result.clarifiedText || result.text,
        raw: result.rawTranscript,
      },
    })
  } catch (error) {
    console.error("[valsea/transcribe]", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Transcription failed",
      },
      { status: 500 }
    )
  }
}
