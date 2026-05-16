"use client"

import { useId, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

const BAR_ANIM = {
  isAnimationActive: true,
  animationDuration: 900,
  animationEasing: "ease-out" as const,
}

function ChartShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="h-[220px] w-full"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}

function AnimatedTooltip({
  active,
  payload,
  label,
  valueSuffix = "",
}: TooltipProps<ValueType, NameType> & { valueSuffix?: string }) {
  if (!active || !payload?.length) return null

  const item = payload[0]
  const value = item?.value

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md"
    >
      {label ? (
        <p className="mb-0.5 text-xs font-medium text-muted-foreground">{label}</p>
      ) : null}
      <p className="font-semibold text-foreground">
        <span className="text-agri-teal">{value}</span>
        {valueSuffix}
      </p>
    </motion.div>
  )
}

interface HealthItem {
  name: string
  health: number
  status?: string
}

interface DiagnosisItem {
  date: string
  count: number
}

export function CropHealthChart({ data }: { data: HealthItem[] }) {
  const gradientId = useId().replace(/:/g, "")
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        label:
          d.name.length > 14 ? `${d.name.slice(0, 13)}…` : d.name,
      })),
    [data]
  )

  if (!data.length) {
    return (
      <p className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        Add crops to see health chart
      </p>
    )
  }

  return (
    <ChartShell>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <defs>
            <linearGradient id={`${gradientId}-high`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--agri-teal-light)" stopOpacity={0.85} />
              <stop offset="100%" stopColor="var(--agri-teal)" stopOpacity={1} />
            </linearGradient>
            <linearGradient id={`${gradientId}-mid`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--agri-teal)" stopOpacity={0.9} />
              <stop offset="100%" stopColor="var(--agri-teal-dark)" stopOpacity={1} />
            </linearGradient>
            <linearGradient id={`${gradientId}-low`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--agri-teal-dark)" stopOpacity={0.85} />
              <stop offset="100%" stopColor="var(--agri-teal-dark)" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="4 4"
            horizontal={false}
            className="stroke-border/60"
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={88}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.35 }}
            content={(props) => (
              <AnimatedTooltip {...props} valueSuffix="% health" />
            )}
          />
          <Bar
            dataKey="health"
            radius={[0, 6, 6, 0]}
            barSize={18}
            maxBarSize={22}
            {...BAR_ANIM}
            animationBegin={80}
            onMouseEnter={(_, index) => setActiveIndex(index)}
          >
            {chartData.map((entry, i) => {
              const fill =
                entry.health >= 80
                  ? `url(#${gradientId}-high)`
                  : entry.health >= 60
                    ? `url(#${gradientId}-mid)`
                    : `url(#${gradientId}-low)`
              const dimmed = activeIndex !== null && activeIndex !== i
              return (
                <Cell
                  key={entry.name}
                  fill={fill}
                  fillOpacity={dimmed ? 0.45 : 1}
                  style={{ transition: "fill-opacity 0.25s ease" }}
                />
              )
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}

export function DiagnosisActivityChart({ data }: { data: DiagnosisItem[] }) {
  const gradientId = useId().replace(/:/g, "")
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  if (!data.length) {
    return (
      <p className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        Run AI diagnosis to see activity
      </p>
    )
  }

  const wideBar = data.length <= 3

  return (
    <ChartShell>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
          barCategoryGap={wideBar ? "28%" : "18%"}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <defs>
            <linearGradient id={`${gradientId}-diag`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="var(--agri-teal-dark)" stopOpacity={0.95} />
              <stop offset="55%" stopColor="var(--agri-teal)" stopOpacity={1} />
              <stop offset="100%" stopColor="var(--agri-teal-light)" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
            className="stroke-border/60"
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.35 }}
            content={(props) => (
              <AnimatedTooltip {...props} valueSuffix=" diagnoses" />
            )}
          />
          <Bar
            dataKey="count"
            fill={`url(#${gradientId}-diag)`}
            radius={[6, 6, 0, 0]}
            maxBarSize={wideBar ? 72 : 40}
            {...BAR_ANIM}
            animationBegin={120}
            onMouseEnter={(_, index) => setActiveIndex(index)}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fillOpacity={activeIndex !== null && activeIndex !== i ? 0.45 : 1}
                style={{ transition: "fill-opacity 0.25s ease" }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}
