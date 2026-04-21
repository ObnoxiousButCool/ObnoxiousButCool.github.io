import type { AmountTierBreakdownItem } from "@/lib/types"
import { cn } from "@/lib/utils"

const tierStyles: Record<AmountTierBreakdownItem["label"], string> = {
  "<₹10K": "bg-[#ECFDF5] text-[#047857]",
  "₹10K–₹50K": "bg-[#EFF6FF] text-[#1D4ED8]",
  "₹50K–₹1L": "bg-[#FFF7ED] text-[#C2410C]",
  ">₹1L": "bg-[#FEF2F2] text-[#B91C1C]",
}

export function AmountTierBreakdown({ items }: { items: AmountTierBreakdownItem[] }) {
  return (
    <div className="rounded-2xl bg-white p-5 card-shadow">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#111827]">Outstanding by amount tier</h3>
          <p className="mt-1 text-sm text-[#6B7280]">Share of total receivables by invoice value band.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl border border-[#EEF2FF] bg-[#F8FAFC] p-4">
            <div className="flex items-center justify-between gap-3">
              <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", tierStyles[item.label])}>
                {item.label}
              </span>
              <span className="text-xs font-medium text-[#6B7280]">{item.percentage}%</span>
            </div>
            <p className="mt-4 text-[22px] font-bold leading-none text-[#111827]">{item.value}</p>
            <p className="mt-2 text-xs text-[#6B7280]">{item.count} invoices</p>
          </div>
        ))}
      </div>
    </div>
  )
}
