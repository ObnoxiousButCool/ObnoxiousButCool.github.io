import { useEffect, useMemo, useState } from "react"
import { AlertCircle, BarChart3, Clock3, Lightbulb, Loader2, TrendingDown, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchDsoAnalytics } from "@/lib/api"
import type { DsoAnalytics, DsoBottleneckStage, DsoProcessMetric } from "@/lib/types"
import { cn } from "@/lib/utils"

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  day: "numeric",
})

const impactTone: Record<DsoBottleneckStage["impactLevel"], string> = {
  High: "bg-[#FEF2F2] text-[#B91C1C]",
  Medium: "bg-[#FFFBEB] text-[#B45309]",
  Low: "bg-[#ECFDF5] text-[#047857]",
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`))
}

function trendLabel(analytics: DsoAnalytics) {
  if (analytics.trendDirection === "Down") {
    return `${Math.abs(analytics.trendDays).toFixed(1)} days better than last month`
  }
  if (analytics.trendDirection === "Up") {
    return `${analytics.trendDays.toFixed(1)} days slower than last month`
  }
  return "Flat versus last month"
}

function StageCard({ stage, maxDays }: { stage: DsoBottleneckStage; maxDays: number }) {
  const width = maxDays > 0 ? Math.min(100, (stage.averageDays / maxDays) * 100) : 0

  return (
    <div className="rounded-2xl bg-[#F8FAFC] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#111827]">{stage.stage}</p>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">{stage.description}</p>
        </div>
        <Badge className={cn("border-0", impactTone[stage.impactLevel])}>{stage.impactLevel}</Badge>
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between text-sm">
          <span className="text-[#6B7280]">Average duration</span>
          <span className="text-lg font-bold text-[#111827]">{stage.averageDays.toFixed(1)}d</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-[#7C3AED]" style={{ width: `${width}%` }} />
        </div>
      </div>
    </div>
  )
}

function ProcessMetricRow({ metric }: { metric: DsoProcessMetric }) {
  const needsAttention = metric.status === "Needs Attention"

  return (
    <div className="grid gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
      <div>
        <p className="text-sm font-semibold text-[#111827]">{metric.transition}</p>
        <p className="mt-1 text-xs text-[#9CA3AF]">
          {metric.source} data, {metric.observedCount} observed event(s)
        </p>
      </div>
      <div className="text-sm text-[#6B7280]">
        Avg <span className="font-semibold text-[#111827]">{metric.averageDays.toFixed(1)}d</span> / benchmark{" "}
        {metric.benchmarkDays.toFixed(1)}d
      </div>
      <Badge
        className={cn(
          "w-fit border-0",
          needsAttention ? "bg-[#FEF2F2] text-[#B91C1C]" : "bg-[#ECFDF5] text-[#047857]"
        )}
      >
        {metric.status}
      </Badge>
    </div>
  )
}

export function InsightsPage() {
  const [analytics, setAnalytics] = useState<DsoAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadAnalytics() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchDsoAnalytics()
        if (active) {
          setAnalytics(data)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unable to load DSO analytics")
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadAnalytics()

    return () => {
      active = false
    }
  }, [])

  const maxStageDays = useMemo(
    () => Math.max(...(analytics?.bottleneckStages.map((stage) => stage.averageDays) ?? [0])),
    [analytics]
  )

  if (loading) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl bg-white px-10 py-12 text-center card-shadow">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#7C3AED]" />
          <p className="mt-4 text-sm font-medium text-[#6B7280]">Calculating DSO analytics...</p>
        </div>
      </section>
    )
  }

  if (!analytics) {
    return (
      <section className="rounded-3xl bg-white p-8 card-shadow">
        <div className="flex items-center gap-3 text-[#B91C1C]">
          <AlertCircle className="h-5 w-5" />
          <p className="font-semibold">DSO analytics unavailable</p>
        </div>
        <p className="mt-3 text-sm text-[#6B7280]">{error || "Try refreshing after the backend API is running."}</p>
      </section>
    )
  }

  const trendImproved = analytics.trendDirection === "Down"

  return (
    <section className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-[32px] bg-white p-6 card-shadow">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7C3AED]">DSO Analytics</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#111827]">
                {analytics.currentDso.toFixed(1)} days
              </h2>
              <p className="mt-2 text-sm text-[#6B7280]">Current Days Sales Outstanding as of {formatDate(analytics.asOf)}</p>
            </div>

            <div
              className={cn(
                "flex items-center gap-3 rounded-3xl px-4 py-3",
                trendImproved ? "bg-[#ECFDF5] text-[#047857]" : "bg-[#FEF2F2] text-[#B91C1C]"
              )}
            >
              {trendImproved ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
              <div>
                <p className="text-sm font-semibold">{trendLabel(analytics)}</p>
                <p className="text-xs opacity-80">Last month: {analytics.lastMonthDso.toFixed(1)} days</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-[#F8FAFC] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#9CA3AF]">Accounts receivable</p>
              <p className="mt-3 text-xl font-bold text-[#111827]">{formatCurrency(analytics.totalAccountsReceivable)}</p>
            </div>
            <div className="rounded-2xl bg-[#F8FAFC] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#9CA3AF]">Avg daily sales</p>
              <p className="mt-3 text-xl font-bold text-[#111827]">{formatCurrency(analytics.averageDailySales)}</p>
            </div>
            <div className="rounded-2xl bg-[#F8FAFC] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#9CA3AF]">Trailing sales</p>
              <p className="mt-3 text-xl font-bold text-[#111827]">{formatCurrency(analytics.trailingSales)}</p>
            </div>
          </div>
        </div>

        <Card className="rounded-[32px] border-0 bg-[#111827] p-1 text-white card-shadow">
          <CardHeader className="px-5 pt-5">
            <CardTitle className="flex items-center gap-2 text-[18px] font-semibold">
              <Lightbulb className="h-5 w-5 text-[#FDE68A]" />
              Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <p className="text-2xl font-bold leading-snug">{analytics.recommendation.narrative}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#A5B4FC]">Projected DSO</p>
                <p className="mt-2 text-xl font-semibold">{analytics.recommendation.projectedDso.toFixed(1)} days</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#A5B4FC]">Faster cash flow</p>
                <p className="mt-2 text-xl font-semibold">{formatCurrency(analytics.recommendation.fasterCashFlow)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[28px] border-0 bg-white p-1 card-shadow">
        <CardHeader className="px-5 pt-5">
          <CardTitle className="flex items-center gap-2 text-[18px] font-semibold text-[#111827]">
            <BarChart3 className="h-5 w-5 text-[#7C3AED]" />
            Bottleneck breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 px-5 pb-5 xl:grid-cols-2">
          {analytics.bottleneckStages.map((stage) => (
            <StageCard key={stage.key} stage={stage} maxDays={maxStageDays} />
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-0 bg-white p-1 card-shadow">
        <CardHeader className="px-5 pt-5">
          <CardTitle className="flex items-center gap-2 text-[18px] font-semibold text-[#111827]">
            <Clock3 className="h-5 w-5 text-[#7C3AED]" />
            Process efficiency tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-5 pb-5">
          {analytics.processEfficiency.map((metric) => (
            <ProcessMetricRow key={metric.transition} metric={metric} />
          ))}
        </CardContent>
      </Card>

      <div className="rounded-2xl bg-white p-5 text-sm leading-6 text-[#6B7280] card-shadow">
        {analytics.dataNotes.map((note) => (
          <p key={note}>{note}</p>
        ))}
      </div>
    </section>
  )
}
