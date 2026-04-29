import { useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"

import { AccountDetailPanel } from "@/components/reminders/ComposerPanel"
import { CustomerList } from "@/components/reminders/CustomerList"
import { TriagePanel } from "@/components/reminders/TriagePanel"
import { useDashboardStore } from "@/lib/dashboard-store"

export function RemindersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    customers,
    triageItems,
    sendReminder,
    regenerateDraft,
    submitTriage,
    loadInteractions,
    loadPlaybook,
  } = useDashboardStore()

  const selectedCustomer =
    customers.find((customer) => customer.id === searchParams.get("customer")) ?? customers[0]
  const selectedCustomerId = selectedCustomer?.id

  const orderedCustomers = useMemo(() => customers, [customers])

  useEffect(() => {
    if (!selectedCustomerId) {
      return
    }

    void Promise.all([loadInteractions(selectedCustomerId), loadPlaybook(selectedCustomerId)])
  }, [loadInteractions, loadPlaybook, selectedCustomerId])

  if (!selectedCustomer) {
    return (
      <section className="grid gap-6 xl:grid-cols-[25%_45%_30%]">
        <CustomerList customers={orderedCustomers} selectedCustomerId="" onSelect={(customerId) => setSearchParams({ customer: customerId })} />
        <div className="rounded-2xl bg-white p-5 card-shadow" />
        <div className="rounded-2xl bg-white p-5 card-shadow" />
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

      <AccountDetailPanel
        key={selectedCustomer.id}
        customer={selectedCustomer}
      />

      <TriagePanel
        customer={selectedCustomer}
        items={triageItems}
        onSelectCustomer={(customerId) => setSearchParams({ customer: customerId })}
        onRegenerate={(channel) => regenerateDraft(selectedCustomer.id, channel)}
        onSend={(channel, message) => sendReminder(selectedCustomer.id, channel, message)}
        onSubmitTriage={submitTriage}
      />
    </section>
  )
}
