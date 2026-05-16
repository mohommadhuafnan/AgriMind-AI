"use client"

import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAdminStats } from "@/hooks/use-admin-stats"
import {
  SignupTrendChart,
  PlatformActivityChart,
  SeverityPieChart,
  DistrictBarChart,
} from "@/components/admin/admin-charts"

export default function AdminAnalyticsPage() {
  const { data, loading, error } = useAdminStats()

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return <p className="text-destructive text-sm">{error}</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Deep platform metrics and trends</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Farmer growth</CardTitle>
          </CardHeader>
          <CardContent>
            <SignupTrendChart data={data?.signups ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AI & diagnosis activity</CardTitle>
          </CardHeader>
          <CardContent>
            <PlatformActivityChart data={data?.activity ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Severity distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <SeverityPieChart data={data?.severity ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Geographic spread</CardTitle>
          </CardHeader>
          <CardContent>
            <DistrictBarChart data={data?.districts ?? []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
