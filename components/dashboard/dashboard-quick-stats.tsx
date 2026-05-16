"use client"

import { Sprout, AlertTriangle, CloudSun, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

type DashboardQuickStatsProps = {
  cropTotal?: number
  cropHealthy?: number
  alerts?: number
  diagnoses?: number
  weatherTemp?: string
  weatherCondition?: string
  className?: string
}

export function DashboardQuickStats({
  cropTotal = 0,
  cropHealthy = 0,
  alerts = 0,
  diagnoses = 0,
  weatherTemp = "—",
  weatherCondition = "—",
  className,
}: DashboardQuickStatsProps) {
  const items = [
    {
      label: "Active crops",
      value: String(cropTotal),
      hint: `${cropHealthy} healthy`,
      icon: Sprout,
      iconClass: "bg-primary/10 text-primary",
    },
    {
      label: "Alerts",
      value: String(alerts),
      hint: "Notifications",
      icon: AlertTriangle,
      iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Weather",
      value: weatherTemp,
      hint: weatherCondition,
      icon: CloudSun,
      iconClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
    {
      label: "AI diagnoses",
      value: String(diagnoses),
      hint: "Total reports",
      icon: TrendingUp,
      iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
  ]

  return (
    <div
      className={cn(
        "grid w-full grid-cols-2 gap-2 sm:max-w-md sm:grid-cols-2 lg:max-w-lg",
        className
      )}
      data-no-translate
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-background/80 px-3 py-2.5 shadow-sm"
        >
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              item.iconClass
            )}
          >
            <item.icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {item.label}
            </p>
            <p className="truncate text-base font-bold leading-tight text-foreground">
              {item.value}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">{item.hint}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
