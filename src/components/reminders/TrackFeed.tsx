import type { TrackEvent } from "@/lib/types"

const typeStyles = {
  "Reminder Sent": "bg-[#DBEAFE] text-[#1E40AF]",
  "Reply Received": "bg-[#D1FAE5] text-[#065F46]",
  "Task Created": "bg-[#FEF3C7] text-[#92400E]",
  "Flag Updated": "bg-[#FEE2E2] text-[#991B1B]",
} as const

export function TrackFeed({ items }: { items: TrackEvent[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl bg-[#F8FAFC] p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-[#9CA3AF]">{item.timestamp}</span>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${typeStyles[item.type]}`}>
              {item.type}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#111827]">{item.description}</p>
        </div>
      ))}
    </div>
  )
}
