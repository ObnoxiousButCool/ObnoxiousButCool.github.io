import { useEffect, useState } from "react"

import { CreditsIndicator } from "@/components/reminders/CreditsIndicator"
import { TrackFeed } from "@/components/reminders/TrackFeed"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Channel, CustomerAccount } from "@/lib/types"
import { cn } from "@/lib/utils"

const channels: Channel[] = ["Email", "SMS", "WhatsApp"]

export function ComposerPanel({
  customer,
  onSend,
  onRegenerate,
}: {
  customer: CustomerAccount
  onSend: (channel: Channel, message: string) => void
  onRegenerate: () => string
}) {
  const [channel, setChannel] = useState<Channel>("Email")
  const [message, setMessage] = useState(customer.draftMessage)
  const [activeTab, setActiveTab] = useState<"composer" | "feed">("composer")

  useEffect(() => {
    setChannel("Email")
    setMessage(customer.draftMessage)
    setActiveTab("composer")
  }, [customer])

  return (
    <div className="rounded-2xl bg-white p-5 card-shadow flex flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#F5F3FF] px-3 py-1.5 text-xs font-medium text-[#111827]">
          {customer.customerName}
        </span>
        <span className="rounded-full bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#111827]">
          ₹{customer.outstanding.toLocaleString("en-IN")}
        </span>
        <span className="rounded-full bg-[#DBEAFE] px-3 py-1.5 text-xs font-medium text-[#1E40AF]">
          {customer.agingDays} days
        </span>
        <span className="rounded-full bg-[#FEE2E2] px-3 py-1.5 text-xs font-medium text-[#991B1B]">
          {customer.riskLevel}
        </span>
      </div>

      <div className="mt-5 flex flex-col">
        {/* Tab switcher */}
        <div className="flex border-b border-[#E5E7EB]">
          <button
            type="button"
            onClick={() => setActiveTab("composer")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === "composer"
                ? "border-[#7C3AED] text-[#7C3AED]"
                : "border-transparent text-[#6B7280] hover:text-[#111827]"
            )}
          >
            AI Composer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("feed")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === "feed"
                ? "border-[#7C3AED] text-[#7C3AED]"
                : "border-transparent text-[#6B7280] hover:text-[#111827]"
            )}
          >
            Track Feed
          </button>
        </div>

        {/* Tab content */}
        <div className="mt-5">
          {activeTab === "composer" && (
            <>
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
                AI draft — edit as needed
              </p>

              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-3 min-h-[240px] rounded-2xl border-[#E5E7EB] bg-[#F8FAFC] p-4 text-sm leading-6 shadow-none"
              />

              <Button
                className="mt-5 h-11 w-full rounded-full bg-[#7C3AED] text-sm font-medium text-white hover:bg-[#6D28D9]"
                onClick={() => onSend(channel, message)}
              >
                Send
              </Button>

              <div className="mt-4 flex items-center justify-between gap-3">
                <CreditsIndicator used={customer.creditsUsed} remaining={847} />
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs font-medium text-[#7C3AED]"
                  onClick={() => setMessage(onRegenerate())}
                >
                  Regenerate
                </Button>
              </div>
            </>
          )}

          {activeTab === "feed" && (
            <TrackFeed items={customer.trackFeed} />
          )}
        </div>
      </div>
    </div>
  )
}