import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { BulkActionBar } from "@/components/queue/BulkActionBar"
import { DefaulterQueueTable } from "@/components/queue/DefaulterQueueTable"
import { StatCards } from "@/components/queue/StatCards"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDashboardStore } from "@/lib/dashboard-store"
import { cn } from "@/lib/utils"

const agingFilters = ["All", "30 days", "45 days", "60+ days"] as const
const payerFilters = ["All", "INS & TPA", "CORPORATE", "N.G.O", "PAY PATIENT", "GOVERNMENT"] as const

export function QueuePage() {
  const navigate = useNavigate()
  const { queueStats, customers, createTask } = useDashboardStore()
  const [query, setQuery] = useState("")
  const [agingFilter, setAgingFilter] = useState<(typeof agingFilters)[number]>("All")
  const [payerFilter, setPayerFilter] = useState<(typeof payerFilters)[number]>("All")
  const [selectedCount, setSelectedCount] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryText, setSummaryText] = useState<string | null>(null)

  const filteredRows = useMemo(
    () =>
      customers.filter((customer) => {
        const value = `${customer.customerName} ${customer.accountRef}`.toLowerCase()
        const matchesQuery = value.includes(query.toLowerCase())
        const matchesAging = agingFilter === "All" || customer.agingBucket === agingFilter
        const matchesPayer = payerFilter === "All" || customer.payerCategory === payerFilter

        return matchesQuery && matchesAging && matchesPayer
      }),
    [agingFilter, customers, payerFilter, query]
  )

const handleAISummary = async () => {
  if (summaryText) {
    setShowSummary((v) => !v)
    return
  }
  setShowSummary(true)
  setSummaryLoading(true)
  try {
    const response = await fetch("http://localhost:8000/api/ai-summary")
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