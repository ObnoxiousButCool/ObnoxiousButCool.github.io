import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DefaulterQueueTable } from "@/features/queue/components/defaulter-queue-table"
import { StatCard } from "@/features/queue/components/stat-card"
import { useDashboardStore } from "@/lib/dashboard-store"
import { cn } from "@/lib/utils"

const filterOptions = ["All", "30-day bucket", "45-day bucket", "60+ days"] as const

export function QueuePage() {
  const { queueStats, customers, createTask } = useDashboardStore()
  const [query, setQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<(typeof filterOptions)[number]>("All")
  const [showSummary, setShowSummary] = useState(false)

  const rows = useMemo(
    () =>
      customers.filter((customer) => {
        const matchesFilter = activeFilter === "All" || customer.bucket === activeFilter
        const value = `${customer.customerName} ${customer.accountRef}`.toLowerCase()
        return matchesFilter && value.includes(query.toLowerCase())
      }),
    [activeFilter, customers, query]
  )

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {queueStats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="rounded-[24px] border border-[#E0DED6] bg-white p-5 shadow-[0_12px_24px_rgba(26,26,46,0.04)]">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#185FA5]">
              Defaulter Queue Dashboard
            </p>
            <h2 className="mt-1 text-[16px] font-medium text-[#1A1A2E]">
              One prioritized view of every outstanding account
            </h2>
            <p className="mt-2 max-w-[760px] text-[13px] leading-6 text-[#5F5E5A]">
              Default sort is smart-priority based on aging, amount, and risk flag so the finance executive can act
              immediately.
            </p>
          </div>

          <Button
            variant="outline"
            className="rounded-full border-[#E0DED6] px-4 text-[12px] font-medium text-[#1A1A2E]"
            onClick={() => setShowSummary((value) => !value)}
          >
            AI Summary ↗
          </Button>
        </div>

        {showSummary ? (
          <div className="mb-5 rounded-[20px] border border-[#E0DED6] bg-[#F1EFE8] p-4 text-[13px] leading-6 text-[#1A1A2E]">
            AI is prioritizing Ramesh Patil, Meera Diagnostics, and Sunita Medicare first because they combine high
            aging, high outstanding value, and weaker recent response signals.
          </div>
        ) : null}

        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {filterOptions.map((filter) => (
              <button
                key={filter}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                  activeFilter === filter
                    ? "border-[#185FA5] bg-[#185FA5] text-white"
                    : "border-[#E0DED6] bg-white text-[#5F5E5A] hover:text-[#1A1A2E]"
                )}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>

          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or account"
            className="max-w-[320px] rounded-full border-[#E0DED6] bg-[#F8F5EF] text-[13px] shadow-none"
          />
        </div>

        {rows.length > 0 ? (
          <DefaulterQueueTable rows={rows} onCreateTask={createTask} />
        ) : (
          <div className="rounded-[20px] border border-dashed border-[#E0DED6] bg-[#F8F5EF] px-6 py-10 text-center">
            <p className="text-[14px] font-medium text-[#1A1A2E]">No accounts match this filter. Try clearing the bucket.</p>
            <button
              className="mt-3 rounded-full border border-[#E0DED6] px-3 py-1.5 text-[12px] font-medium text-[#185FA5]"
              onClick={() => {
                setActiveFilter("All")
                setQuery("")
              }}
              type="button"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
