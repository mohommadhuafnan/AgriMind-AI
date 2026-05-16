"use client"

import Link from "next/link"
import { FileText, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { buildDiagnosisShareUrl } from "@/services/whatsapp.service"
import type { CropDiagnosisResult } from "@/types/ai"

interface DiagnosisReportActionsProps {
  reportId: string
  cropType: string
  diagnosis: CropDiagnosisResult
}

export function DiagnosisReportActions({
  reportId,
  cropType,
  diagnosis,
}: DiagnosisReportActionsProps) {
  const whatsappUrl = buildDiagnosisShareUrl({ cropType, diagnosis, reportId })

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" className="gap-2" asChild>
        <a href={`/api/diagnosis/${reportId}/pdf`} target="_blank" rel="noopener noreferrer">
          <FileText className="h-4 w-4" />
          Download PDF
        </a>
      </Button>
      <Button variant="outline" size="sm" className="gap-2" asChild>
        <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4 text-[#25D366]" />
          Share via WhatsApp
        </Link>
      </Button>
    </div>
  )
}
