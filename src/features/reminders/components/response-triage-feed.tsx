import { TriageCard } from "@/features/reminders/components/triage-card"
import type { TriageItem } from "@/lib/types"

export function ResponseTriageFeed({ items }: { items: TriageItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-[22px] border border-dashed border-[#E0DED6] bg-[#F8F5EF] px-6 py-10 text-center">
        <p className="text-[14px] font-medium text-[#1A1A2E]">No responses yet today. Check back after reminders go out.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <TriageCard key={item.id} item={item} />
      ))}
    </div>
  )
}
