import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { getDiagnosisReport } from "@/services/diagnosis.service"
import { getUserByFirebaseUid } from "@/services/user.service"
import { generateDiagnosisPdf } from "@/services/pdf.service"
import type { CropDiagnosisResult } from "@/types/ai"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const report = await getDiagnosisReport(session.uid, id)
    if (!report) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 })
    }

    const user = await getUserByFirebaseUid(session.uid)
    const pdf = generateDiagnosisPdf({
      farmerName: user?.displayName ?? "Farmer",
      cropType: report.cropType,
      createdAt: report.createdAt,
      diagnosis: report.result as CropDiagnosisResult,
      imageUrl: report.imageUrl,
    })

    const filename = `agrimind-diagnosis-${report.cropType}-${id}.pdf`.replace(/\s+/g, "-")

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("[diagnosis/pdf]", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate PDF" },
      { status: 500 }
    )
  }
}
