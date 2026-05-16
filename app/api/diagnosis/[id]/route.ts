import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { getDiagnosisReport } from "@/services/diagnosis.service"

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

    return NextResponse.json({ success: true, data: report })
  } catch (error) {
    console.error("[diagnosis/id GET]", error)
    return NextResponse.json(
      { success: false, error: "Failed to load report" },
      { status: 500 }
    )
  }
}
