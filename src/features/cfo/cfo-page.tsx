import { useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, LineChart, RefreshCw, ShieldCheck, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { approveCfoIncentive, fetchCfoForecast } from "@/lib/api"
import type {
  CfoConfidenceBucket,
  CfoForecast,
  CfoForecastWindow,
  CfoIncentiveApproval,
  CfoScenario,
} from "@/lib/types"
import { cn } from "@/lib/utils"

const confidenceBuckets: CfoConfidenceBucket[] = ["High Confidence", "Medium Confidence", "Low Confidence"]

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  day: "numeric",
})

const confidenceTone: Record<CfoConfidenceBucket, string> = {
  "High Confidence": "bg-[#ECFDF5] text-[#047857]",
  "Medium Confidence": "bg-[#FFFBEB] text-[#B45309]",
  "Low Confidence": "bg-[#FEF2F2] text-[#B91C1C]",
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`))
}

function formatProbability(value: number) {
  return `${Math.round(value * 100)}%`
}

function ForecastCard({ label, window }: { label: string; window: CfoForecastWindow }) {
  const grossTotal = confidenceBuckets.reduce((total, bucket) => total + window.buckets[bucket].amount, 0)

  return (
    <Card className="rounded-[28px] border-0 bg-white p-1 card-shadow">
      <CardHeader className="px-5 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-[18px] font-semibold text-[#111827]">{label}</CardTitle>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-[#9CA3AF]">
              Through {formatDate(window.windowEnd)}
            </p>
          </div>
          <div className="rounded-full bg-[#EEF2FF] p-3 text-[#4F46E5]">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-5 pb-5">
        <div>
          <p className="text-sm text-[#6B7280]">Weighted cash forecast</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#111827]">
            {formatCurrency(window.weightedTotal)}
          </p>
          <p className="mt-1 text-xs text-[#9CA3AF]">
            Gross in window: {formatCurrency(grossTotal)}
          </p>
        </div>

        <div className="space-y-3">
          {confidenceBuckets.map((bucketName) => {
            const bucket = window.buckets[bucketName]
            const percentage = grossTotal > 0 ? (bucket.amount / grossTotal) * 100 : 0

            return (
              <div key={bucketName} className="rounded-2xl bg-[#F8FAFC] p-3">
                <div className="flex items-center justify-between gap-3">
                  <Badge className={cn("border-0", confidenceTone[bucketName])}>{bucketName}</Badge>
                  <span className="text-sm font-semibold text-[#111827]">{formatCurrency(bucket.weightedAmount)}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-[#7C3AED]"
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-[#6B7280]">
                  {bucket.count} invoice(s), {formatCurrency(bucket.amount)} outstanding
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function ScenarioCard({ label, scenario }: { label: string; scenario: CfoScenario }) {
  const rows = [
    { label: "Best case", percentile: "90th percentile", value: scenario.bestCase, color: "text-[#047857]" },
    { label: "Expected", percentile: "50th percentile", value: scenario.expected, color: "text-[#4F46E5]" },
    { label: "Worst case", percentile: "10th percentile", value: scenario.worstCase, color: "text-[#B91C1C]" },
  ]

  return (
    <Card className="rounded-[28px] border-0 bg-white p-1 card-shadow">
      <CardHeader className="px-5 pt-5">
        <CardTitle className="text-[17px] font-semibold text-[#111827]">{label}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 px-5 pb-5 md:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="rounded-2xl bg-[#F8FAFC] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">{row.percentile}</p>
            <p className={cn("mt-3 text-xl font-bold", row.color)}>{formatCurrency(row.value)}</p>
            <p className="mt-1 text-sm text-[#6B7280]">{row.label}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function ApprovalCard({
  approval,
  approvingInvoice,
  onApprove,
}: {
  approval: CfoIncentiveApproval
  approvingInvoice: string | null
  onApprove: (invoiceId: string) => void
}) {
  const approved = approval.status === "Approved"
  const approving = approvingInvoice === approval.invoiceId

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-[#111827]">{approval.accountName}</h3>
            <Badge className={approved ? "border-0 bg-[#ECFDF5] text-[#047857]" : "border-0 bg-[#FEF3C7] text-[#92400E]"}>
              {approval.status}
            </Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">{approval.recommendation}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#6B7280]">
            <span>Invoice {approval.invoiceId}</span>
            <span>Outstanding {formatCurrency(approval.outstanding)}</span>
            <span>Probability {formatProbability(approval.paymentProbability)}</span>
            <span>Incentive {approval.discountPercent}% ({formatCurrency(approval.incentiveAmount)})</span>
          </div>
        </div>

        <Button
          className={cn(
            "rounded-full px-5",
            approved ? "bg-[#ECFDF5] text-[#047857] hover:bg-[#D1FAE5]" : "bg-[#111827] text-white hover:bg-[#1F2937]"
          )}
          onClick={() => onApprove(approval.invoiceId)}
        >
          {approved ? "Approved" : approving ? "Approving..." : "Approve"}
        </Button>
      </div>
    </div>
  )
}

export function CfoPage() {
  const [forecast, setForecast] = useState<CfoForecast | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [approvingInvoice, setApprovingInvoice] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadForecast() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchCfoForecast()
        if (active) {
          setForecast(data)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unable to load CFO forecast")
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadForecast()

    return () => {
      active = false
    }
  }, [])

  const pendingApprovals = useMemo(
    () => forecast?.incentiveApprovals.filter((item) => item.status !== "Approved").length ?? 0,
    [forecast]
  )

  async function handleApprove(invoiceId: string) {
    setApprovingInvoice(invoiceId)
    setError(null)

    try {
      await approveCfoIncentive(invoiceId, "CFO")
      const refreshed = await fetchCfoForecast()
      setForecast(refreshed)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to approve incentive")
    } finally {
      setApprovingInvoice(null)
    }
  }

  if (loading) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl bg-white px-10 py-12 text-center card-shadow">
          <RefreshCw className="mx-auto h-10 w-10 animate-spin text-[#7C3AED]" />
          <p className="mt-4 text-sm font-medium text-[#6B7280]">Building CFO cash-flow forecast...</p>
        </div>
      </section>
    )
  }

  if (!forecast) {
    return (
      <section className="rounded-3xl bg-white p-8 card-shadow">
        <div className="flex items-center gap-3 text-[#B91C1C]">
          <AlertCircle className="h-5 w-5" />
          <p className="font-semibold">CFO forecast unavailable</p>
        </div>
        <p className="mt-3 text-sm text-[#6B7280]">{error || "Try refreshing after the backend API is running."}</p>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[32px] bg-[#111827] p-6 text-white card-shadow">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <LineChart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C4B5FD]">CFO View</p>
                <h2 className="mt-1 text-3xl font-bold tracking-tight">Cash-flow command center</h2>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#D1D5DB]">
              Live payment probability, near-term cash forecast, and high-value incentive approvals from the active
              collections queue.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#A5B4FC]">As of</p>
              <p className="mt-2 text-xl font-semibold">{formatDate(forecast.asOf)}</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#A5B4FC]">Pending approvals</p>
              <p className="mt-2 text-xl font-semibold">{pendingApprovals}</p>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-3 rounded-2xl bg-[#FEF2F2] p-4 text-sm text-[#B91C1C]">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <ForecastCard label="Next 7 days" window={forecast.forecasts.next7Days} />
        <ForecastCard label="Next 30 days" window={forecast.forecasts.next30Days} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ScenarioCard label="7-day scenario planning" scenario={forecast.scenarios.next7Days} />
        <ScenarioCard label="30-day scenario planning" scenario={forecast.scenarios.next30Days} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.15fr]">
        <Card className="rounded-[28px] border-0 bg-white p-1 card-shadow">
          <CardHeader className="px-5 pt-5">
            <CardTitle className="flex items-center gap-2 text-[18px] font-semibold text-[#111827]">
              <ShieldCheck className="h-5 w-5 text-[#7C3AED]" />
              Per-payer predictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-5 pb-5">
            {forecast.payerPredictions.map((prediction) => (
              <div key={prediction.accountName} className="rounded-2xl bg-[#F8FAFC] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{prediction.accountName}</p>
                    <p className="mt-2 text-sm leading-6 text-[#6B7280]">{prediction.summary}</p>
                  </div>
                  <Badge className="border-0 bg-[#EEF2FF] text-[#4F46E5]">
                    {formatProbability(prediction.paymentProbability)}
                  </Badge>
                </div>
                <p className="mt-3 text-xs text-[#9CA3AF]">
                  Expected {formatDate(prediction.expectedDate)} - {formatCurrency(prediction.outstanding)} outstanding
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-0 bg-white p-1 card-shadow">
          <CardHeader className="px-5 pt-5">
            <CardTitle className="flex items-center gap-2 text-[18px] font-semibold text-[#111827]">
              <CheckCircle2 className="h-5 w-5 text-[#047857]" />
              High-value incentive approvals
            </CardTitle>
            <p className="text-sm text-[#6B7280]">
              One-click CFO approval for discounts surfaced by recovery probability.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 px-5 pb-5">
            {forecast.incentiveApprovals.length ? (
              forecast.incentiveApprovals.map((approval) => (
                <ApprovalCard
                  key={approval.invoiceId}
                  approval={approval}
                  approvingInvoice={approvingInvoice}
                  onApprove={handleApprove}
                />
              ))
            ) : (
              <div className="rounded-2xl bg-[#F8FAFC] p-6 text-sm text-[#6B7280]">
                No high-value incentives need CFO approval right now.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
