import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { BulkActionBar } from "@/components/queue/BulkActionBar"
import { AmountTierBreakdown } from "@/components/queue/AmountTierBreakdown"
import { DefaulterQueueTable } from "@/components/queue/DefaulterQueueTable"
import { StatCards } from "@/components/queue/StatCards"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDashboardStore } from "@/lib/dashboard-store"
import { cn } from "@/lib/utils"

const agingFilters = ["All", "30 days", "45 days", "60+ days"] as const
const amountFilters = ["All", "<₹10K", "₹10K–50K", ">₹50K", ">₹1L"] as const
const payerFilters = ["All", "INS & TPA", "CORPORATE", "N.G.O", "PAY PATIENT", "GOVERNMENT"] as const

function matchesAmountFilter(outstanding: number, filter: (typeof amountFilters)[number]) {
  if (filter === "<₹10K") return outstanding < 10000
  if (filter === "₹10K–50K") return outstanding >= 10000 && outstanding <= 50000
  if (filter === ">₹50K") return outstanding > 50000
  if (filter === ">₹1L") return outstanding > 100000
  return true
}

export function QueuePage() {
  const navigate = useNavigate()
  const { queueStats, amountBreakdown, customers, createTask } = useDashboardStore()
  const [query, setQuery] = useState("")
  const [agingFilter, setAgingFilter] = useState<(typeof agingFilters)[number]>("All")
  const [amountFilter, setAmountFilter] = useState<(typeof amountFilters)[number]>("All")
  const [payerFilter, setPayerFilter] = useState<(typeof payerFilters)[number]>("All")
  const [vipOnly, setVipOnly] = useState(false)
  const [selectedCount, setSelectedCount] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryText, setSummaryText] = useState<string | null>(null)

  const filteredRows = useMemo(
    () =>
      customers.filter((customer) => {
        const value = `${customer.customerName} ${customer.accountRef}`.toLowerCase()
        const matchesQuery = value.includes(query.toLowerCase())
        const matchesAging = agingFilter === "All" || (customer.agingBucket || customer.bucket) === agingFilter
        const matchesAmount = matchesAmountFilter(customer.outstanding, amountFilter)
        const matchesPayer = payerFilter === "All" || (customer.payerCategory || customer.payerType) === payerFilter
        const matchesVip = !vipOnly || customer.vipQueueEligible

        return matchesQuery && matchesAging && matchesAmount && matchesPayer && matchesVip
      }),
    [agingFilter, amountFilter, customers, payerFilter, query, vipOnly]
  )

  const vipCount = useMemo(() => customers.filter((customer) => customer.vipQueueEligible).length, [customers])

const handleAISummary = async () => {
  if (summaryText) {
    setShowSummary((v) => !v)
    return
  }
  setShowSummary(true)
  setSummaryLoading(true)
  try {
    const response = await fetch(import.meta.env.VITE_API_BASE_URL + "/api/ai-summary")
    const data = await response.json()
    setSummaryText(data.summary)
  } catch (err) {
    console.error("Summary error:", err)
    setSummaryText(`Error: ${err instanceof Error ? err.message : String(err)}`)
  } finally {
    setSummaryLoading(false)
  }
}

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-semibold text-[#111827]">Queue</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Prioritized defaulters ranked by aging, risk, and response patterns.
          </p>
        </div>
        <Button
          className="rounded-full bg-[#7C3AED] px-4 text-sm font-medium text-white hover:bg-[#6D28D9]"
          onClick={handleAISummary}
        >
          AI Summary ↗
        </Button>
      </div>

      {showSummary ? (
        <div className="rounded-2xl bg-white p-5 text-sm leading-6 text-[#6B7280] card-shadow">
          {summaryLoading ? "Generating AI summary…" : summaryText}
        </div>
      ) : null}

      <StatCards stats={queueStats} />

      <AmountTierBreakdown items={amountBreakdown} />

      <div className="space-y-5 rounded-2xl bg-transparent">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by customer or account"
              className="h-11 rounded-full border-[#E5E7EB] bg-white pl-11 text-sm shadow-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {agingFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setAgingFilter(filter)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  agingFilter === filter ? "bg-[#7C3AED] text-white" : "bg-white text-[#6B7280] hover:text-[#111827]"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {amountFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setAmountFilter(filter)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  amountFilter === filter ? "bg-[#111827] text-white" : "bg-white text-[#6B7280] hover:text-[#111827]"
                )}
              >
                {filter}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setVipOnly((current) => !current)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              vipOnly ? "bg-[#DC2626] text-white" : "bg-white text-[#B91C1C] hover:bg-[#FEF2F2]"
            )}
          >
            VIP Queue ({vipCount})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {payerFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setPayerFilter(filter)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                payerFilter === filter ? "bg-[#7C3AED] text-white" : "bg-white text-[#6B7280] hover:text-[#111827]"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        <BulkActionBar
          selectedCount={selectedCount}
          onSendBulk={() => {
            if (filteredRows[0]) {
              navigate(`/reminders?customer=${filteredRows[0].id}`)
            }
          }}
        />

        <DefaulterQueueTable
          rows={filteredRows}
          onCreateTask={createTask}
          onSelectionChange={setSelectedCount}
        />
      </div>
    </section>
  )
}
