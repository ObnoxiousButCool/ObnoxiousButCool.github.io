import { useMemo } from "react"
import { useSearchParams } from "react-router-dom"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AiMessageComposer } from "@/features/reminders/components/ai-message-composer"
import { ResponseTriageFeed } from "@/features/reminders/components/response-triage-feed"
import { useDashboardStore } from "@/lib/dashboard-store"

export function RemindersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { customers, triageItems, sendReminder, regenerateDraft } = useDashboardStore()

  const selectedCustomer =
    customers.find((customer) => customer.id === searchParams.get("customer")) ?? customers[0]

  const relatedTriage = useMemo(
    () => triageItems.filter((item) => item.customerId === selectedCustomer.id),
    [selectedCustomer.id, triageItems]
  )

  return (
    <section className="grid grid-cols-[1.15fr_0.85fr] gap-6">
      <div className="space-y-6">
        <div className="rounded-[24px] border border-[#E0DED6] bg-white p-5 shadow-[0_12px_24px_rgba(26,26,46,0.04)]">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#185FA5]">
            AI Message Composer + Response Triage Feed
          </p>
          <h2 className="mt-1 text-[16px] font-medium text-[#1A1A2E]">
            Generate, review, send contextual reminders in under 60 seconds
          </h2>
          <p className="mt-2 text-[13px] leading-6 text-[#5F5E5A]">
            Email is functional in the MVP. SMS and WhatsApp are intentionally simulated but fully visible in the UI.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {customers.map((customer) => (
            <button
              key={customer.id}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-medium ${
                customer.id === selectedCustomer.id
                  ? "border-[#185FA5] bg-[#185FA5] text-white"
                  : "border-[#E0DED6] bg-white text-[#5F5E5A]"
              }`}
              onClick={() => setSearchParams({ customer: customer.id })}
              type="button"
            >
              {customer.customerName}
            </button>
          ))}
        </div>

        <AiMessageComposer
          customer={selectedCustomer}
          onRegenerate={() => regenerateDraft(selectedCustomer.id)}
          onSend={(channel, message) => sendReminder(selectedCustomer.id, channel, message)}
        />
      </div>

      <div className="space-y-6">
        <Card className="rounded-[24px] border border-[#E0DED6] bg-white shadow-none">
          <CardHeader className="border-b border-[#E0DED6]">
            <CardTitle className="text-[16px] font-medium text-[#1A1A2E]">Sent log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="rounded-[18px] bg-[#F8F5EF] p-4">
              <p className="text-[12px] font-medium text-[#1A1A2E]">{selectedCustomer.lastAction}</p>
              <p className="mt-1 text-[12px] text-[#5F5E5A]">
                {selectedCustomer.reminderCount} reminders · last via {selectedCustomer.lastChannel}
              </p>
            </div>
            <div className="rounded-[18px] bg-[#F8F5EF] p-4">
              <p className="text-[12px] font-medium text-[#1A1A2E]">Response history</p>
              <ul className="mt-2 space-y-2 text-[12px] text-[#5F5E5A]">
                {selectedCustomer.responseHistory.map((entry) => (
                  <li key={entry}>• {entry}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#5F5E5A]">Triage feed</p>
          <ResponseTriageFeed items={relatedTriage.length > 0 ? relatedTriage : triageItems} />
        </div>
      </div>
    </section>
  )
}
