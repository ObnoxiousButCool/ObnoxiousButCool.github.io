import { useEffect, useState } from "react"
import { AlertTriangle, Crown } from "lucide-react"

import { CreditsIndicator } from "@/components/reminders/CreditsIndicator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { fetchRewardForAccount } from "@/lib/api"
import type { Channel, CustomerAccount, PayerReward, RewardTier } from "@/lib/types"
import { cn } from "@/lib/utils"

const channels: Channel[] = ["Email", "SMS", "WhatsApp"]

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

function normalizeChannel(value?: string): Channel {
  if (value === "SMS" || value === "WhatsApp") {
    return value
  }
  return "Email"
}

const rewardTierStyles: Record<RewardTier, string> = {
  Gold: "bg-[#FEF3C7] text-[#92400E]",
  Silver: "bg-[#E5E7EB] text-[#374151]",
  Bronze: "bg-[#FFEDD5] text-[#9A3412]",
  None: "bg-[#F3F4F6] text-[#6B7280]",
}

function RewardTierBadge({ tier }: { tier: RewardTier }) {
  return (
    <Badge className={cn("border-transparent font-semibold", rewardTierStyles[tier])}>
      {tier === "Gold" ? <Crown className="h-3 w-3" /> : null}
      {tier}
    </Badge>
  )
}

export function ComposerPanel({
  customer,
  onSend,
  onRegenerate,
}: {
  customer: CustomerAccount
  onSend: (channel: Channel, message: string) => Promise<void>
  onRegenerate: (channel: Channel) => Promise<string>
}) {
  const [channel, setChannel] = useState<Channel>(normalizeChannel(customer.recommendedChannel))
  const [message, setMessage] = useState(customer.draftMessage)
  const [isSending, setIsSending] = useState(false)
  const incentiveApproved = customer.incentiveApproved === true || customer.incentiveApproved === 1

  useEffect(() => {
    setChannel(normalizeChannel(customer.recommendedChannel))
    setMessage(customer.draftMessage)
  }, [customer.draftMessage, customer.id, customer.recommendedChannel])

  return (
    <div className="flex flex-col">
      {incentiveApproved ? (
        <p className="mb-3 rounded-xl bg-[#ECFDF5] px-3 py-2 text-xs font-semibold leading-5 text-[#047857]">
          {"\u2713"} Incentive approved: {customer.approvedDiscountPct || 0}% discount ({formatCurrency(customer.approvedDiscountAmount || 0)}) - included in message
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {channels.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setChannel(option)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              channel === option
                ? "bg-[#7C3AED] text-white"
                : "bg-[#F8FAFC] text-[#6B7280] hover:text-[#111827]"
            )}
          >
            {option}
            {option === "WhatsApp" ? (
              <span className="ml-2 text-[11px] opacity-80">(Simulated)</span>
            ) : null}
          </button>
        ))}
      </div>

      <p className="mt-4 text-[11px] font-medium text-[#9CA3AF]">
        AI draft - edit as needed
      </p>

      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="mt-3 min-h-[240px] rounded-2xl border-[#E5E7EB] bg-[#F8FAFC] p-4 text-sm leading-6 shadow-none"
      />

      <Button
        className="mt-5 h-11 w-full rounded-full bg-[#7C3AED] text-sm font-medium text-white hover:bg-[#6D28D9]"
        disabled={isSending}
        onClick={() => {
          void (async () => {
            setIsSending(true)
            try {
              await onSend(channel, message)
            } finally {
              setIsSending(false)
            }
          })()
        }}
      >
        {isSending ? "Sending..." : "Send"}
      </Button>

      <div className="mt-4 flex items-center justify-between gap-3">
        <CreditsIndicator used={customer.creditsUsed} remaining={847} />
        <Button
          variant="link"
          className="h-auto p-0 text-xs font-medium text-[#7C3AED]"
          onClick={() => {
            void (async () => {
              setMessage(await onRegenerate(channel))
            })()
          }}
        >
          Regenerate
        </Button>
      </div>
    </div>
  )
}

export function AccountDetailPanel({ customer }: { customer: CustomerAccount }) {
  const scorecard = customer.behavioralScorecard
  const playbook = customer.interventionPlaybook
  const [reward, setReward] = useState<PayerReward | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadReward = async () => {
      try {
        const data = await fetchRewardForAccount(customer.customerName)
        if (isMounted) setReward(data)
      } catch {
        if (isMounted) setReward(null)
      }
    }

    void loadReward()
    return () => {
      isMounted = false
    }
  }, [customer.customerName])

  return (
    <div className="flex max-h-[760px] flex-col overflow-y-auto rounded-2xl bg-white p-5 card-shadow">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#F5F3FF] px-3 py-1.5 text-xs font-medium text-[#111827]">
          {customer.customerName}
        </span>
        <span className="rounded-full bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#111827]">
          {formatCurrency(customer.outstanding)}
        </span>
        <span className="rounded-full bg-[#DBEAFE] px-3 py-1.5 text-xs font-medium text-[#1E40AF]">
          {customer.agingDays} days
        </span>
        <span className="rounded-full bg-[#FEE2E2] px-3 py-1.5 text-xs font-medium text-[#991B1B]">
          {customer.riskLevel}
        </span>
        <span className="rounded-full bg-[#111827] px-3 py-1.5 text-xs font-medium text-white">
          {customer.amountTier || "Tier pending"}
        </span>
        {customer.cfoNotificationRequired ? (
          <span className="rounded-full bg-[#FEF2F2] px-3 py-1.5 text-xs font-semibold text-[#B91C1C]">
            CFO review
          </span>
        ) : null}
      </div>

      <div className="mt-5">
        <div className="mb-4 rounded-2xl bg-[#F8FAFC] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#111827]">
                {customer.reminderStrategy || "Standard follow-up"}
              </p>
              <p className="mt-1 text-xs leading-5 text-[#6B7280]">
                {customer.remindersSent || 0}/{customer.maxReminders || 0} touches used.
                Escalates at {customer.escalationThresholdDays || "configured"} days.
              </p>
            </div>
            {customer.managerInvolvement ? (
              <span className="rounded-full bg-[#FFF7ED] px-3 py-1 text-xs font-semibold text-[#C2410C]">
                Manager involved
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-xs leading-5 text-[#111827]">
            Next step: {customer.nextAction || "Send the recommended reminder"}
          </p>
          {customer.escalationRequired || customer.reminderLimitReached || customer.manualFollowUpRequired ? (
            <p className="mt-2 rounded-xl bg-[#FEF2F2] px-3 py-2 text-xs font-medium leading-5 text-[#B91C1C]">
              {customer.reminderReason || "This playbook step requires manual finance approval before sending."}
            </p>
          ) : null}
        </div>

        {scorecard ? (
          <div className="mb-4 rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#111827]">Behavioral scorecard</p>
                <p className="mt-1 text-xs text-[#6B7280]">{scorecard.fallbackLayer}</p>
              </div>
              {scorecard.manualReviewRequired ? (
                <span className="rounded-full bg-[#FEF2F2] px-3 py-1 text-xs font-semibold text-[#B91C1C]">
                  Manual review required
                </span>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl bg-[#F8FAFC] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">
                  Avg days to pay
                </p>
                <p className="mt-2 text-lg font-bold text-[#111827]">{scorecard.averageDaysToPay.toFixed(1)}d</p>
              </div>
              <div className="rounded-2xl bg-[#F8FAFC] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">
                  Ignored reminders
                </p>
                <p className="mt-2 text-lg font-bold text-[#111827]">
                  {scorecard.ignoredReminders}/{scorecard.observedReminders || 0}
                </p>
              </div>
              <div className="rounded-2xl bg-[#F8FAFC] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">
                  Total outstanding
                </p>
                <p className="mt-2 text-lg font-bold text-[#111827]">
                  {formatCurrency(scorecard.totalOutstandingBalance)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#F8FAFC] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">
                  Preferred channel
                </p>
                <p className="mt-2 text-lg font-bold text-[#111827]">{scorecard.preferredChannel}</p>
              </div>
              <div className="rounded-2xl bg-[#F8FAFC] p-3 sm:col-span-2 xl:col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">
                  Best reminder window
                </p>
                <p className="mt-2 text-lg font-bold text-[#111827]">
                  {scorecard.bestSendDay}, {scorecard.bestSendTimeWindow}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-[#6B7280]">{scorecard.note}</p>

            {reward ? (
              <div className="mt-4 rounded-2xl bg-[#F8FAFC] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">Prompt payer rewards</p>
                    <p className="mt-1 text-xs text-[#6B7280]">
                      {reward.onTimeRate.toFixed(1)}% on-time payment rate
                    </p>
                  </div>
                  <RewardTierBadge tier={reward.tier} />
                </div>
                {reward.tier === "Gold" || reward.tier === "Silver" ? (
                  <p className="mt-3 text-xs font-semibold text-[#047857]">
                    {reward.rebatePct}% rebate active for this payer.
                  </p>
                ) : null}
                {reward.atRiskOfDowngrade ? (
                  <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-semibold text-[#92400E]">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    At risk of tier downgrade
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {playbook ? (
          <div className="mb-4 rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#111827]">AI intervention playbook</p>
                <p className="mt-1 text-xs text-[#6B7280]">{playbook.similarCaseBasis}</p>
              </div>
              <div className="text-right text-xs text-[#6B7280]">
                <p>{playbook.sourceMode}</p>
                <p>{new Date(playbook.generatedAt).toLocaleString("en-IN")}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-[#ECFDF5] px-3 py-1 font-semibold text-[#047857]">
                {playbook.approvalSummary.automatedSteps} automated
              </span>
              <span className="rounded-full bg-[#FEF2F2] px-3 py-1 font-semibold text-[#B91C1C]">
                {playbook.approvalSummary.manualSteps} manual approval
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {playbook.steps.map((step, index) => (
                <div key={`${step.action}-${index}`} className="rounded-2xl bg-[#F8FAFC] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">
                        Step {index + 1}: {step.action}
                      </p>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        {step.channel} - {step.timing}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#4338CA]">
                        {Math.round(step.estimatedSuccessProbability * 100)}% success
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          step.requiresApproval
                            ? "bg-[#FEF2F2] text-[#B91C1C]"
                            : "bg-[#ECFDF5] text-[#047857]"
                        )}
                      >
                        {step.automationLevel}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[#6B7280]">{step.rationale}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
