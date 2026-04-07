import type { CustomerAccount } from "@/lib/types"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function buildMessageTemplate(customer: Pick<
  CustomerAccount,
  "customerName" | "outstanding" | "accountRef" | "agingDays" | "modifierValue"
>) {
  return `Hello ${customer.customerName}, your outstanding amount of ${formatCurrency(customer.outstanding)} for ${customer.accountRef} is now ${customer.agingDays} days overdue. ${customer.modifierValue}. Please confirm your payment plan today so we can update the account appropriately.`
}
