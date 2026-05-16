"use client"

import { useEffect, useState } from "react"
import { Brain, Loader2, AlertTriangle, MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

interface AiMonitorData {
  sessionsToday: number
  totalVoiceMessages: number
  highSeverityCount: number
  activePriceAlerts: number
  recentConversations: {
    id: string
    title: string
    language: string
    messageCount: number
    updatedAt: string
    farmerName: string
  }[]
  recentDiagnoses: {
    cropType: string
    disease: string
    severity: string
    confidence: number
    createdAt: string
    farmerName: string
  }[]
}

export default function AdminAiMonitorPage() {
  const [data, setData] = useState<AiMonitorData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/ai-monitor")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const metrics = [
    { label: "Voice sessions today", value: data?.sessionsToday ?? 0, icon: Brain },
    { label: "Total voice messages", value: data?.totalVoiceMessages ?? 0, icon: MessageSquare },
    { label: "High severity diagnoses", value: data?.highSeverityCount ?? 0, icon: AlertTriangle },
    { label: "Active price alerts", value: data?.activePriceAlerts ?? 0, icon: AlertTriangle },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Monitor</h1>
        <p className="text-muted-foreground">Voice assistant usage and diagnosis oversight</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <m.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent voice conversations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.recentConversations ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No conversations yet</p>
            ) : (
              data?.recentConversations.map((c) => (
                <div key={c.id} className="rounded-lg border p-3">
                  <div className="flex justify-between gap-2">
                    <p className="font-medium text-sm">{c.title}</p>
                    <span className="text-xs text-muted-foreground uppercase">{c.language}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {c.farmerName} · {c.messageCount} messages ·{" "}
                    {formatDistanceToNow(new Date(c.updatedAt), { addSuffix: true })}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent diagnoses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.recentDiagnoses ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No diagnoses yet</p>
            ) : (
              data?.recentDiagnoses.map((d, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex justify-between gap-2">
                    <p className="font-medium text-sm">
                      {d.cropType} — {d.disease}
                    </p>
                    <span
                      className={`text-xs capitalize ${
                        d.severity === "high" ? "text-destructive" : "text-muted-foreground"
                      }`}
                    >
                      {d.severity}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {d.farmerName} · {Math.round(d.confidence)}% ·{" "}
                    {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
