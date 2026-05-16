import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { isCloudinaryConfigured } from "@/lib/cloudinary/client"
import { uploadCropImage } from "@/services/upload.service"

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "Image storage not configured. Diagnosis still works with local preview.",
        },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { imageBase64 } = body as { imageBase64?: string }

    if (!imageBase64?.trim()) {
      return NextResponse.json(
        { success: false, error: "Image data is required" },
        { status: 400 }
      )
    }

    const url = await uploadCropImage(imageBase64.trim())
    if (!url) {
      return NextResponse.json(
        { success: false, error: "Upload failed" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: { url } })
  } catch (error) {
    console.error("[upload/image]", error)
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    )
  }
}
