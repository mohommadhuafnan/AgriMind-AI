"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

export function useDiagnosisHistory() {
  const [reports, setReports] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/diagnosis")
      const json = await res.json()
      if (res.ok) setReports(json.data ?? [])
    } catch {
      toast.error("Failed to load diagnosis history")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const downloadPdf = (reportId: string) => {
    window.open(`/api/diagnosis/${reportId}/pdf`, "_blank")
  }

  return { reports, loading, fetchHistory, downloadPdf }
}
