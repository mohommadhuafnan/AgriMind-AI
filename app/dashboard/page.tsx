"use client"

import { motion } from "framer-motion"
import {
  Sprout,
  AlertTriangle,
  TrendingUp,
  CloudSun,
  Bell,
  ArrowRight,
  Plus,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useDashboard } from "@/hooks/use-dashboard"
import {
  CropHealthChart,
  DiagnosisActivityChart,
} from "@/components/dashboard/charts/dashboard-charts"
import { DashboardPrimaryActions } from "@/components/dashboard/dashboard-primary-actions"
import { LiveDateTime } from "@/components/dashboard/live-datetime"
import { useLanguage } from "@/contexts/language-context"
import { getGreetingKey } from "@/lib/datetime/greeting"
import { formatDistanceToNow } from "date-fns"

export default function DashboardPage() {
  const { sessionUser } = useAuth()
  const { t } = useLanguage()
  const { data, loading } = useDashboard()
  const firstName = sessionUser?.displayName?.split(" ")[0] ?? "Farmer"

  const cropStats = (data?.cropStats as Record<string, number>) ?? {}
  const weather = (data?.weatherSummary as Record<string, string>) ?? {}
  const reminders = (data?.reminders as Record<string, unknown>[]) ?? []
  const recentCrops = (data?.recentCrops as Record<string, unknown>[]) ?? []
  const healthTrend = (data?.healthTrend as { name: string; health: number }[]) ?? []
  const diagnosisTrend = (data?.diagnosisTrend as { date: string; count: number }[]) ?? []
  const recentAlerts = (data?.recentAlerts as { message: string; time: string }[]) ?? []
  const unread = Number(data?.unreadNotifications ?? 0)

  const stats = [
    {
      title: "Active Crops",
      value: String(cropStats.total ?? 0),
      change: `${cropStats.healthy ?? 0} healthy`,
      icon: Sprout,
      color: "bg-primary",
    },
    {
      title: "Active Alerts",
      value: String(unread),
      change: `${cropStats.warning ?? 0} crops need attention`,
      icon: AlertTriangle,
      color: "bg-accent",
    },
    {
      title: "AI Diagnoses",
      value: String(data?.diagnosisCount ?? 0),
      change: "Total reports",
      icon: TrendingUp,
      color: "bg-chart-3",
    },
    {
      title: "Weather",
      value: weather.temp ?? "—",
      change: weather.condition ?? "—",
      icon: CloudSun,
      color: "bg-chart-5",
    },
  ]

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-background to-background p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
      >
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">
            {t(getGreetingKey())}, {firstName}!
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {t("dashboard.welcomeSubtitle")}
          </p>
        </div>
        <LiveDateTime variant="card" className="w-full shrink-0 sm:w-auto" />
      </motion.div>

      <DashboardPrimaryActions />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card>
              <CardContent className="p-5">
                <motion.div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Crop Health</CardTitle>
          </CardHeader>
          <CardContent>
            <CropHealthChart data={healthTrend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Diagnosis Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <DiagnosisActivityChart data={diagnosisTrend} />
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">My Crops</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/crops">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentCrops.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No crops yet</p>
                <Button asChild>
                  <Link href="/dashboard/crops/new">
                    <Plus className="h-4 w-4 mr-2" /> Add First Crop
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCrops.map((crop) => (
                  <Link
                    key={String(crop._id)}
                    href={`/dashboard/crops/${crop._id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium">{String(crop.name)}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {String(crop.cropType)} · {String(crop.stage)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      {Number(crop.health)}%
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3">
              {reminders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming reminders</p>
              ) : (
                reminders.map((r) => (
                  <div key={String(r._id)} className="p-2 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium">{String(r.title)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(String(r.dueDate)).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/reminders">Manage Reminders</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No alerts yet</p>
              ) : (
                recentAlerts.map((a, i) => (
                  <div key={i} className="flex gap-2 p-2 rounded-lg bg-muted/50">
                    <AlertTriangle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm">{a.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(a.time), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
