"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const COLORS = ["var(--primary)", "var(--accent)", "var(--chart-3)", "var(--chart-5)"]

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
  if (!data.length) {
    return (
      <p className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        Add crops to see health chart
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey="health" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={entry.name}
              fill={
                entry.health >= 80
                  ? COLORS[0]
                  : entry.health >= 60
                    ? COLORS[1]
                    : COLORS[3]
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function DiagnosisActivityChart({ data }: { data: DiagnosisItem[] }) {
  if (!data.length) {
    return (
      <p className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        Run AI diagnosis to see activity
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
