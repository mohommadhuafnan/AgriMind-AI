"use client"

import { motion } from "framer-motion"
import { useMemo, useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  BarChart3,
  Bell,
  Loader2,
  MessageCircle,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { useMarket } from "@/hooks/use-market"
import { buildWhatsAppUrl } from "@/lib/whatsapp/config"
import { toast } from "sonner"

const CHART_COLORS = [
  "var(--primary)",
  "var(--accent)",
  "var(--chart-3)",
  "var(--destructive)",
]

function formatRelativeTime(date: Date | null) {
  if (!date) return "—"
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`
  return date.toLocaleDateString()
}

export default function MarketPage() {
  const {
    prices,
    locations,
    chartData,
    insights,
    alerts,
    lastUpdated,
    priceSource,
    dataAsOf,
    stale,
    openAiConfigured,
    loading,
    insightsLoading,
    refreshing,
    createAlert,
    refreshPrices,
  } = useMarket()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCrop, setSelectedCrop] = useState("all")
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertCrop, setAlertCrop] = useState("")
  const [alertCondition, setAlertCondition] = useState<"above" | "below">("above")
  const [alertPrice, setAlertPrice] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const filteredPrices = useMemo(
    () =>
      prices.filter((crop) => {
        const q = searchQuery.toLowerCase()
        const matchesSearch =
          crop.name.toLowerCase().includes(q) ||
          (crop.nameSi?.includes(searchQuery) ?? false)
        const matchesCrop =
          selectedCrop === "all" ||
          crop.name.toLowerCase() === selectedCrop
        return matchesSearch && matchesCrop
      }),
    [prices, searchQuery, selectedCrop]
  )

  const chartKeys = useMemo(() => {
    if (!chartData[0]) return []
    return Object.keys(chartData[0]).filter((k) => k !== "date")
  }, [chartData])

  const buyersWhatsAppUrl = buildWhatsAppUrl(
    "Hello AgriMind, I need help finding buyers for my harvest. My crops are: "
  )

  const handleCreateAlert = async () => {
    if (!alertCrop || !alertPrice) {
      toast.error("Select a crop and target price")
      return
    }
    setSubmitting(true)
    try {
      await createAlert({
        cropName: alertCrop,
        condition: alertCondition,
        targetPrice: Number(alertPrice),
      })
      toast.success("Price alert set — we'll notify you in the app")
      setAlertOpen(false)
      setAlertPrice("")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create alert")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[40vh] gap-2 text-muted-foreground"
      >
        <Loader2 className="h-6 w-6 animate-spin" />
        Loading market data…
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">Market Prices</h1>
          <p className="text-muted-foreground">
            Sri Lanka wholesale prices updated by OpenAI estimates and AI demand
            forecasts.
          </p>
          {priceSource === "ai_estimate" && (
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              AI-estimated wholesale (not live auction). Market date:{" "}
              {dataAsOf ?? "—"}. Compare with Dambulla / local buyers before
              selling.
            </p>
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col sm:items-end gap-2"
        >
          <motion.div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div
              className={`h-2 w-2 rounded-full ${
                refreshing
                  ? "bg-accent animate-pulse"
                  : stale
                    ? "bg-amber-500"
                    : "bg-primary"
              }`}
            />
            Last updated: {formatRelativeTime(lastUpdated)}
            {stale && !refreshing && (
              <span className="text-amber-600 dark:text-amber-400">
                (may be outdated)
              </span>
            )}
          </motion.div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={refreshing || !openAiConfigured}
            onClick={() =>
              void refreshPrices()
                .then(() => toast.success("Market prices refreshed with OpenAI"))
                .catch((e) =>
                  toast.error(e instanceof Error ? e.message : "Refresh failed")
                )
            }
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {refreshing ? "Updating prices…" : "Refresh prices (AI)"}
          </Button>
          {!openAiConfigured && (
            <p className="text-xs text-muted-foreground max-w-xs text-right">
              Set OPENAI_API_KEY in .env.local to enable AI price updates.
            </p>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search crops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCrop} onValueChange={setSelectedCrop}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by crop" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Crops</SelectItem>
            {prices.map((crop) => (
              <SelectItem key={crop.name} value={crop.name.toLowerCase()}>
                {crop.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-chart-3/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Market Insights
              {insightsLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {(insights.length ? insights : []).map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl ${
                    rec.type === "warning"
                      ? "bg-destructive/10"
                      : rec.type === "info"
                        ? "bg-muted"
                        : "bg-primary/10"
                  }`}
                >
                  <h4 className="font-medium text-foreground mb-2">{rec.title}</h4>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
              ))}
              {!insightsLoading && insights.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-3">
                  Insights will appear when OpenAI is configured.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Current Market Prices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Crop
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                        Price
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                        Change
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                        Demand
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Location
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrices.map((crop) => (
                      <tr
                        key={crop.name}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-foreground">{crop.name}</p>
                            {crop.nameSi && (
                              <p className="text-xs text-muted-foreground">{crop.nameSi}</p>
                            )}
                          </div>
                        </td>
                        <td className="text-right py-4 px-4">
                          <p className="font-semibold text-foreground">Rs. {crop.price}</p>
                          <p className="text-xs text-muted-foreground">per {crop.unit}</p>
                        </td>
                        <td className="text-right py-4 px-4">
                          <div
                            className={`flex items-center justify-end gap-1 ${
                              crop.trend === "up"
                                ? "text-primary"
                                : crop.trend === "down"
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {crop.trend === "up" ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : crop.trend === "down" ? (
                              <TrendingDown className="h-4 w-4" />
                            ) : null}
                            <span className="font-medium">
                              {crop.changePercent > 0 ? "+" : ""}
                              {crop.changePercent}%
                            </span>
                          </div>
                        </td>
                        <td className="text-center py-4 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                              crop.demandLevel === "high"
                                ? "bg-primary/10 text-primary"
                                : crop.demandLevel === "medium"
                                  ? "bg-accent/10 text-accent"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {crop.demandLevel}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {crop.location}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Best Selling Locations
                </CardTitle>
                <p className="text-xs text-muted-foreground font-normal">
                  Synced with current crop prices
                  {priceSource === "ai_estimate" ? " (AI-updated)" : ""}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {locations.map((location) => (
                  <div key={location.name} className="p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">{location.name}</h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          location.demand === "Very High"
                            ? "bg-primary/10 text-primary"
                            : location.demand === "High"
                              ? "bg-accent/10 text-accent"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {location.demand}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Popular: {location.crops.join(", ")}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardContent className="p-4 space-y-3">
                <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full gap-2" variant="outline">
                      <Bell className="h-4 w-4" />
                      Set Price Alerts
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Price alert</DialogTitle>
                      <DialogDescription>
                        Get an in-app notification when a crop hits your target price.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <Label>Crop</Label>
                        <Select
                          value={alertCrop}
                          onValueChange={setAlertCrop}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select crop" />
                          </SelectTrigger>
                          <SelectContent>
                            {prices.map((c) => (
                              <SelectItem key={c.name} value={c.name}>
                                {c.name} — Rs.{c.price}/{c.unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Notify when price is</Label>
                        <Select
                          value={alertCondition}
                          onValueChange={(v) =>
                            setAlertCondition(v as "above" | "below")
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="above">Above target</SelectItem>
                            <SelectItem value="below">Below target</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Target price (Rs.)</Label>
                        <Input
                          type="number"
                          min={1}
                          placeholder="e.g. 300"
                          value={alertPrice}
                          onChange={(e) => setAlertPrice(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleCreateAlert}
                        disabled={submitting}
                        className="gap-2"
                      >
                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Save alert
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {alerts.length > 0 && (
                  <div className="text-xs text-muted-foreground space-y-1 pt-1 border-t border-border">
                    <p className="font-medium text-foreground">Active alerts</p>
                    {alerts.map((a) => (
                      <p key={a._id}>
                        {a.cropName} {a.condition} Rs.{a.targetPrice}
                      </p>
                    ))}
                  </div>
                )}

                <Button className="w-full gap-2" variant="outline" asChild>
                  <a href={buyersWhatsAppUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                    Find Nearby Buyers
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Price Trends (Last 5 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `Rs.${v}`} />
                  <Tooltip
                    formatter={(value: number) => [`Rs. ${value}`, ""]}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  {chartKeys.map((key, i) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      name={key.replace(/_/g, " ")}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
