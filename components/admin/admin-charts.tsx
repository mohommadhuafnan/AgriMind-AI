"use client"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const SEVERITY_COLORS: Record<string, string> = {
  low: "hsl(var(--primary))",
  medium: "hsl(var(--accent))",
  high: "hsl(var(--destructive))",
}

export function SignupTrendChart({
  data,
}: {
  data: { date: string; signups: number }[]
}) {
  if (!data.length) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No signup data yet</p>
  }
  return (
    <div className="h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} />
          <YAxis className="text-xs" allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="signups" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Signups" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function PlatformActivityChart({
  data,
}: {
  data: { date: string; diagnoses: number; voice: number }[]
}) {
  if (!data.length) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">No activity data yet</p>
    )
  }
  return (
    <div className="h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} />
          <YAxis className="text-xs" allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="diagnoses"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            name="Diagnoses"
          />
          <Line
            type="monotone"
            dataKey="voice"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            dot={false}
            name="Voice sessions"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SeverityPieChart({
  data,
}: {
  data: { severity: string; count: number }[]
}) {
  if (!data.length) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">No diagnosis reports yet</p>
    )
  }
  return (
    <div className="h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="severity"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ severity, count }) => `${severity}: ${count}`}
          >
            {data.map((entry) => (
              <Cell
                key={entry.severity}
                fill={SEVERITY_COLORS[entry.severity] ?? "hsl(var(--muted-foreground))"}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DistrictBarChart({
  data,
}: {
  data: { district: string; farmers: number }[]
}) {
  if (!data.length) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">No district data yet</p>
    )
  }
  return (
    <div className="h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis type="number" allowDecimals={false} />
          <YAxis dataKey="district" type="category" width={90} tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="farmers" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} name="Farmers" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
