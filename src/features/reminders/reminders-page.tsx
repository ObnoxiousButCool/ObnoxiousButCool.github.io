import { useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"

import { ComposerPanel } from "@/components/reminders/ComposerPanel"
import { CustomerList } from "@/components/reminders/CustomerList"
import { TriagePanel } from "@/components/reminders/TriagePanel"
import { useDashboardStore } from "@/lib/dashboard-store"

export function RemindersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { customers, triageItems, sendReminder, regenerateDraft, loadInteractions } = useDashboardStore()

  const selectedCustomer =
    customers.find((customer) => customer.id === searchParams.get("customer")) ?? customers[0]

  const orderedCustomers = useMemo(() => customers, [customers])

  useEffect(() => {
    if (!selectedCustomer) {
      return
    }

    void loadInteractions(selectedCustomer.id)
  }, [selectedCustomer?.id])

  if (!selectedCustomer) {
    return (
      <section className="grid gap-6 xl:grid-cols-[25%_45%_30%]">
        <CustomerList customers={orderedCustomers} selectedCustomerId="" onSelect={(customerId) => setSearchParams({ customer: customerId })} />
        <div className="rounded-2xl bg-white p-5 card-shadow" />
        <TriagePanel items={triageItems} onSelectCustomer={(customerId) => setSearchParams({ customer: customerId })} />
      </section>
    )
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[25%_45%_30%]">
      <CustomerList
        customers={orderedCustomers}
        selectedCustomerId={selectedCustomer.id}
        onSelect={(customerId) => setSearchParams({ customer: customerId })}
      />

      <ComposerPanel
        customer={selectedCustomer}
        onRegenerate={() => regenerateDraft(selectedCustomer.id)}
        onSend={(channel, message) => sendReminder(selectedCustomer.id, channel, message)}
      />

      <TriagePanel items={triageItems} onSelectCustomer={(customerId) => setSearchParams({ customer: customerId })} />
    </section>
  )
}
