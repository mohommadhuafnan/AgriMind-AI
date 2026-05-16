import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { diagnoseCrop } from "@/services/ai.service"
import { saveDiagnosisReport } from "@/services/diagnosis.service"
import { uploadCropImage } from "@/services/upload.service"
import { createNotification } from "@/services/notification.service"
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
    const { imageBase64, cropType, description, language } = body as {
      imageBase64?: string
      cropType?: string
      description?: string
      language?: SupportedLanguage
    }

    if (!imageBase64?.trim()) {
      return NextResponse.json(
        { success: false, error: "Crop image is required" },
        { status: 400 }
      )
    }

    if (!cropType?.trim()) {
      return NextResponse.json(
        { success: false, error: "Crop type is required" },
        { status: 400 }
      )
    }

    const lang: SupportedLanguage = language ?? "en"

    const trimmedImage = imageBase64.trim()
    const diagnosis = await diagnoseCrop({
      imageBase64: trimmedImage,
      cropType: cropType.trim(),
      description: description?.trim(),
      language: lang,
    })

    let imageUrl: string | undefined
    try {
      imageUrl = (await uploadCropImage(trimmedImage)) ?? undefined
    } catch {
      /* Cloudinary optional */
    }

    const report = await saveDiagnosisReport({
      firebaseUid: user.uid,
      cropType: cropType.trim(),
      description: description?.trim(),
      imageUrl,
      language: lang,
      diagnosis,
    })

    const isPlant = diagnosis.isValidPlantImage !== false
    await createNotification({
      firebaseUid: user.uid,
      type: "diagnosis",
      title: isPlant ? "Diagnosis complete" : "Upload a plant photo",
      message: isPlant
        ? `${diagnosis.disease} detected on ${cropType} (${diagnosis.confidence}% confidence)`
        : `We could not analyze ${cropType} — image is not a clear plant photo.`,
      link: `/dashboard/diagnosis/history?id=${report._id}`,
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      data: {
        ...diagnosis,
        reportId: String(report._id),
        imageUrl,
      },
    })
  } catch (error) {
    console.error("[ai/diagnose]", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Diagnosis failed",
      },
      { status: 500 }
    )
  }
}
