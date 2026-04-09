import type { CustomerAccount } from "@/lib/types"
import { cn } from "@/lib/utils"

const agingStyles = {
  "30 days": "bg-[#DBEAFE] text-[#1E40AF]",
  "45 days": "bg-[#FEF3C7] text-[#92400E]",
  "60+ days": "bg-[#FEE2E2] text-[#991B1B]",
} as const

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function CustomerList({
  customers,
  selectedCustomerId,
  onSelect,
}: {
  customers: CustomerAccount[]
  selectedCustomerId: string
  onSelect: (customerId: string) => void
}) {
  return (
    <div className="rounded-2xl bg-white p-5 card-shadow">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-[#111827]">Defaulters</h3>
        <span className="rounded-full bg-[#F3E8FF] px-2.5 py-1 text-[11px] font-medium text-[#7C3AED]">
          {customers.length}
        </span>
      </div>

      <div className="mt-5 max-h-[680px] space-y-3 overflow-y-auto pr-1">
        {customers.map((customer) => (
          <button
            key={customer.id}
            type="button"
            onClick={() => onSelect(customer.id)}
            className={cn(
              "w-full rounded-2xl border-l-[3px] bg-[#F8FAFC] p-4 text-left transition-colors",
              customer.id === selectedCustomerId
                ? "border-l-[#7C3AED] bg-[#F5F3FF]"
                : "border-l-transparent hover:bg-[#F3F4F6]"
            )}
          >
            <p className="text-sm font-semibold text-[#111827]">{customer.customerName}</p>
            <p className="mt-1 text-[13px] text-[#6B7280]">{formatCurrency(customer.outstanding)}</p>
            <span
              className={cn(
                "mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium",
                agingStyles[customer.bucket]
              )}
            >
              {customer.agingDays} days
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
