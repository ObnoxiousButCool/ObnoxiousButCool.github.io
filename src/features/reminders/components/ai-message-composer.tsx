import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import type { Channel, CustomerAccount } from "@/lib/types"
import { cn } from "@/lib/utils"

const channels: Channel[] = ["Email", "SMS", "WhatsApp"]

export function AiMessageComposer({
  customer,
  onSend,
  onRegenerate,
}: {
  customer: CustomerAccount
  onSend: (channel: Channel, message: string) => void
  onRegenerate: () => string
}) {
  const [channel, setChannel] = useState<Channel>(customer.lastChannel)
  const [message, setMessage] = useState(customer.draftMessage)

  useEffect(() => {
    setChannel(customer.lastChannel)
    setMessage(customer.draftMessage)
  }, [customer])

  return (
    <Card className="rounded-[24px] border border-[#E0DED6] bg-white shadow-none">
      <CardHeader className="gap-3 border-b border-[#E0DED6] pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#185FA5]">AI Message Composer</p>
            <CardTitle className="mt-1 text-[16px] font-medium text-[#1A1A2E]">Generate, review, and send contextual reminders</CardTitle>
          </div>
          <div className="rounded-full bg-[#F1EFE8] px-3 py-1.5 text-[12px] font-medium text-[#1A1A2E]">
            {customer.customerName} · {customer.accountRef}
          </div>
        </div>
        <div className="flex gap-2">
          {channels.map((option) => (
            <button
              key={option}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                channel === option
                  ? "border-[#185FA5] bg-[#185FA5] text-white"
                  : "border-[#E0DED6] bg-white text-[#5F5E5A]"
              )}
              onClick={() => setChannel(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[18px] bg-[#F8F5EF] p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#5F5E5A]">Outstanding</p>
            <p className="mt-2 text-[14px] font-medium text-[#1A1A2E]">
              {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
                customer.outstanding
              )}
            </p>
          </div>
          <div className="rounded-[18px] bg-[#F8F5EF] p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#5F5E5A]">Risk level</p>
            <p className="mt-2 text-[14px] font-medium text-[#1A1A2E]">{customer.riskLevel}</p>
          </div>
          <div className="rounded-[18px] bg-[#F8F5EF] p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#5F5E5A]">Modifier</p>
            <p className="mt-2 text-[14px] font-medium text-[#1A1A2E]">{customer.modifierValue}</p>
          </div>
        </div>

        <div>
          <label className="text-[12px] font-medium text-[#1A1A2E]" htmlFor="ai-draft">
            AI draft — edit as needed
          </label>
          <Textarea
            id="ai-draft"
            maxLength={400}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="mt-2 min-h-[220px] rounded-[22px] border-[#E0DED6] bg-[#F8F5EF] p-4 text-[13px] leading-6 shadow-none"
          />
          <p className="mt-2 text-right text-[12px] text-[#5F5E5A]">{message.length}/400</p>
        </div>

        <div className="rounded-[18px] bg-[#F1EFE8] p-4">
          <p className="text-[12px] font-medium text-[#1A1A2E]">AI context</p>
          <p className="mt-2 text-[13px] leading-6 text-[#5F5E5A]">{customer.aiSummary}</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-[12px] text-[#5F5E5A]">
            {customer.reminderCount} reminders sent so far · last touch via {customer.lastChannel}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-full border-[#E0DED6] px-4 text-[12px] font-medium text-[#1A1A2E]"
              onClick={() => setMessage(onRegenerate())}
            >
              Regenerate
            </Button>
            <Button
              className="rounded-full bg-[#185FA5] px-4 text-[12px] font-medium text-white hover:bg-[#144f88]"
              onClick={() => onSend(channel, message)}
            >
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
