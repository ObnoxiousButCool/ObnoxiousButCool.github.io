import type { TriageItem } from "@/lib/types"
import { cn } from "@/lib/utils"

const classificationStyles = {
  Commitment: "bg-[#D1FAE5] text-[#065F46]",
  Disputed: "bg-[#FEF3C7] text-[#92400E]",
  "No response": "bg-[#FEE2E2] text-[#991B1B]",
} as const

export function TriagePanel({
  items,
  onSelectCustomer,
}: {
  items: TriageItem[]
  onSelectCustomer: (customerId: string) => void
}) {
  return (
    <div className="rounded-2xl bg-white p-5 card-shadow">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-[#111827]">Response triage</h3>
        <span className="rounded-full bg-[#D1FAE5] px-2.5 py-1 text-[11px] font-medium text-[#065F46]">3 new</span>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectCustomer(item.customerId)}
            className="w-full rounded-2xl bg-[#F8FAFC] p-4 text-left transition-colors hover:bg-[#F5F3FF]"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#111827]">{item.customerName}</p>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium",
                  classificationStyles[item.classification]
                )}
              >
                {item.classification}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#111827]">{item.rawReply}</p>
            <p className="mt-3 text-xs text-[#6B7280]">AI action taken: {item.actionTaken}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
