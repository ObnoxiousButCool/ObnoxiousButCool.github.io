import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, Crown, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fetchRewards, recalculateRewards } from "@/lib/api"
import { useDashboardStore } from "@/lib/dashboard-store"
import type { PayerReward, RewardTier } from "@/lib/types"
import { cn } from "@/lib/utils"

const tierOrder: RewardTier[] = ["Gold", "Silver", "Bronze"]

const tierStyles: Record<RewardTier, string> = {
  Gold: "bg-[#FEF3C7] text-[#92400E]",
  Silver: "bg-[#E5E7EB] text-[#374151]",
  Bronze: "bg-[#FFEDD5] text-[#9A3412]",
  None: "bg-[#F3F4F6] text-[#6B7280]",
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

function TierBadge({ tier }: { tier: RewardTier }) {
  return (
    <Badge className={cn("border-transparent font-semibold", tierStyles[tier])}>
      {tier === "Gold" ? <Crown className="h-3 w-3" /> : null}
      {tier}
    </Badge>
  )
}

export function RewardsPage() {
  const { customers } = useDashboardStore()
  const [rewards, setRewards] = useState<PayerReward[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRecalculating, setIsRecalculating] = useState(false)

  const outstandingByAccount = useMemo(() => {
    const totals = new Map<string, number>()
    customers.forEach((customer) => {
      totals.set(customer.customerName, (totals.get(customer.customerName) || 0) + customer.outstanding)
    })
    return totals
  }, [customers])

  const tierSummary = useMemo(
    () =>
      tierOrder.map((tier) => {
        const tierRewards = rewards.filter((reward) => reward.tier === tier)
        const covered = tierRewards.reduce(
          (sum, reward) => sum + (outstandingByAccount.get(reward.accountName) || 0),
          0
        )

        return {
          tier,
          count: tierRewards.length,
          covered,
        }
      }),
    [outstandingByAccount, rewards]
  )

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setIsLoading(true)
      try {
        const data = await fetchRewards()
        if (isMounted) setRewards(data)
      } catch {
        if (isMounted) toast.error("Failed to load rewards")
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void load()
    return () => {
      isMounted = false
    }
  }, [])

  const handleRecalculate = async () => {
    setIsRecalculating(true)
    try {
      const data = await recalculateRewards()
      setRewards(data)
      toast.success("Rewards recalculated")
    } catch {
      toast.error("Failed to recalculate rewards")
    } finally {
      setIsRecalculating(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-semibold text-[#111827]">Rewards</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Prompt payer tiers based on payment reliability and early settlement history.
          </p>
        </div>
        <Button
          className="rounded-full bg-[#7C3AED] px-4 text-sm font-medium text-white hover:bg-[#6D28D9]"
          disabled={isRecalculating}
          onClick={handleRecalculate}
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", isRecalculating ? "animate-spin" : "")} />
          {isRecalculating ? "Recalculating..." : "Recalculate"}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[34%_66%]">
        <div className="space-y-4">
          {tierSummary.map((item) => (
            <div key={item.tier} className="rounded-2xl bg-white p-5 card-shadow">
              <div className="flex items-center justify-between gap-3">
                <TierBadge tier={item.tier} />
                <span className="text-xs font-medium text-[#9CA3AF]">{item.count} payers</span>
              </div>
              <p className="mt-5 text-2xl font-bold text-[#111827]">{formatCurrency(item.covered)}</p>
              <p className="mt-1 text-xs text-[#6B7280]">Total outstanding covered</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white p-5 card-shadow">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#111827]">Payer list</p>
            <span className="text-xs text-[#9CA3AF]">{rewards.length} records</span>
          </div>

          <div className="mt-4 space-y-3">
            {isLoading ? (
              <p className="rounded-xl bg-[#F8FAFC] p-4 text-sm text-[#6B7280]">Loading rewards...</p>
            ) : rewards.length === 0 ? (
              <p className="rounded-xl bg-[#F8FAFC] p-4 text-sm text-[#6B7280]">No paid invoice history found yet.</p>
            ) : (
              rewards.map((reward) => (
                <div key={reward.accountName} className="rounded-2xl border border-[#E5E7EB] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">{reward.accountName}</p>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        {reward.onTimePayments}/{reward.totalInvoices} on-time payments
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <TierBadge tier={reward.tier} />
                      <Badge variant="outline">{reward.rebatePct}% rebate</Badge>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#6B7280]">On-time rate</span>
                      <span className="font-semibold text-[#111827]">{reward.onTimeRate.toFixed(1)}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
                      <div
                        className="h-full rounded-full bg-[#7C3AED]"
                        style={{ width: `${Math.min(100, Math.max(0, reward.onTimeRate))}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-[#6B7280]">{reward.rewardLabel || "No reward currently active"}</p>
                    {reward.atRiskOfDowngrade ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-semibold text-[#92400E]">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        At risk of tier downgrade
                      </span>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
