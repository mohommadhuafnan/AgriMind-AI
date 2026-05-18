"use client"

import { motion } from "framer-motion"
import { Users, Sprout, Brain, Bell, Loader2, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAdminStats } from "@/hooks/use-admin-stats"
import {
  SignupTrendChart,
  PlatformActivityChart,
  SeverityPieChart,
  DistrictBarChart,
} from "@/components/admin/admin-charts"
import { AnimatedStatValue } from "@/components/ui/animated-counter"
import { ScrollReveal } from "@/components/motion/scroll-reveal"

export default function AdminDashboardPage() {
  const { data, loading, error } = useAdminStats()
  const stats = data?.stats

  const cards = stats
    ? [
        {
          title: "Total Farmers",
          value: String(stats.totalFarmers),
          sub: `+${stats.farmersThisWeek} this week`,
          icon: Users,
        },
        {
          title: "Crop Reports",
          value: String(stats.totalDiagnoses),
          sub: `${stats.totalCrops} active crops tracked`,
          icon: Sprout,
        },
        {
          title: "AI Sessions Today",
          value: String(stats.aiSessionsToday),
          sub: "Voice assistant conversations",
          icon: Brain,
        },
        {
          title: "Unread Alerts",
          value: String(stats.activeAlerts),
          sub: `${stats.totalOfficers} officers on platform`,
          icon: Bell,
        },
      ]
    : []

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        Loading analytics…
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Admin Overview</h1>
        <p className="text-muted-foreground">
          Platform analytics, farmer activity, and AI monitoring.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card>
              <CardContent className="flex items-start justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="mt-1 text-3xl font-bold">
                    <AnimatedStatValue display={stat.value} />
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Farmer Signups (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SignupTrendChart data={data?.signups ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Platform Activity (14 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <PlatformActivityChart data={data?.activity ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Diagnosis Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <SeverityPieChart data={data?.severity ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Farmers by District</CardTitle>
          </CardHeader>
          <CardContent>
            <DistrictBarChart data={data?.districts ?? []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
