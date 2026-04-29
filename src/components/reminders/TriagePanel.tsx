import { useState } from "react"
import { LoaderCircle } from "lucide-react"

import { ComposerPanel } from "@/components/reminders/ComposerPanel"
import { TrackFeed } from "@/components/reminders/TrackFeed"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Channel, CustomerAccount, TriageItem, TriageResult } from "@/lib/types"
import { cn } from "@/lib/utils"

const classificationStyles = {
  Commitment: "bg-[#D1FAE5] text-[#065F46]",
  Disputed: "bg-[#FEF3C7] text-[#92400E]",
  "No response": "bg-[#E5E7EB] text-[#374151]",
} as const

const resultClassificationStyles = {
  "Payment Commitment": "bg-[#D1FAE5] text-[#065F46]",
  "Disputed Issue": "bg-[#FEF3C7] text-[#92400E]",
  "No Response": "bg-[#E5E7EB] text-[#374151]",
} as const

const ownerByTaskType: Record<string, string> = {
  "Field Visit": "Field Representative",
  "Dispute Resolution": "Billing Team",
  "Partial Payment Review": "Finance Head",
  "Manual Review": "Senior Finance Officer",
}

function normalizeResultClassification(category: string): keyof typeof resultClassificationStyles {
  const normalized = category.trim().toLowerCase()
  if (normalized.includes("commit")) return "Payment Commitment"
  if (normalized.includes("no response")) return "No Response"
  return "Disputed Issue"
}

function getActionText(action: Record<string, unknown>) {
  const taskType = typeof action.task_type === "string" ? action.task_type : ""
  const nextAction = typeof action.next_action === "string" ? action.next_action : ""
  return taskType || nextAction || "Finance follow-up"
}

function getAssignedOwner(action: Record<string, unknown>) {
  const taskType = typeof action.task_type === "string" ? action.task_type : ""
  if (taskType && ownerByTaskType[taskType]) {
    return ownerByTaskType[taskType]
  }
  return "Finance Team"
}

function ResponseTriageTab({
  customer,
  items,
  onSelectCustomer,
  onSubmitTriage,
}: {
  customer: CustomerAccount
  items: TriageItem[]
  onSelectCustomer: (customerId: string) => void
  onSubmitTriage: (invoiceId: string, responseText: string) => Promise<TriageResult>
}) {
  const [responseText, setResponseText] = useState("")
  const [result, setResult] = useState<TriageResult | null>(null)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resultClassification = result ? normalizeResultClassification(result.category) : null
  const taskDescription = result ? getActionText(result.triageAction) : ""
  const assignedOwner = result ? getAssignedOwner(result.triageAction) : ""

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-[#F8FAFC] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">
          Selected account
        </p>
        <p className="mt-2 text-sm font-semibold text-[#111827]">{customer.customerName}</p>
        <p className="mt-1 text-xs text-[#6B7280]">{customer.invoiceId || customer.id}</p>
      </div>

      <Textarea
        value={responseText}
        onChange={(event) => {
          setResponseText(event.target.value)
          setError("")
        }}
        placeholder="Paste payer's reply here…"
        className="min-h-[180px] rounded-2xl border-[#E5E7EB] bg-[#F8FAFC] p-4 text-sm leading-6 shadow-none"
      />

      <Button
        className="h-11 w-full rounded-full bg-[#7C3AED] text-sm font-medium text-white hover:bg-[#6D28D9]"
        disabled={!responseText.trim() || isSubmitting}
        onClick={() => {
          void (async () => {
            setIsSubmitting(true)
            setError("")
            try {
              const triageResult = await onSubmitTriage(customer.invoiceId || customer.id, responseText)
              setResult(triageResult)
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to classify response")
            } finally {
              setIsSubmitting(false)
            }
          })()
        }}
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <LoaderCircle className="size-4 animate-spin" />
            Classifying
          </span>
        ) : (
          "Classify Response"
        )}
      </Button>

      {isSubmitting ? (
        <div className="rounded-2xl bg-[#F8FAFC] p-4">
          <div className="h-3 w-28 animate-pulse rounded-full bg-[#E5E7EB]" />
          <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-[#E5E7EB]" />
          <div className="mt-2 h-3 w-4/5 animate-pulse rounded-full bg-[#E5E7EB]" />
        </div>
      ) : null}

      {error ? (
        <p className="rounded-2xl bg-[#FEF2F2] px-4 py-3 text-xs font-medium leading-5 text-[#B91C1C]">
          {error}
        </p>
      ) : null}

      {result && resultClassification ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <span
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
              resultClassificationStyles[resultClassification]
            )}
          >
            {resultClassification}
          </span>
          <p className="mt-3 text-sm leading-6 text-[#111827]">{result.summary}</p>
          <p className="mt-3 text-xs leading-5 text-[#6B7280]">
            Task created: {taskDescription} → Assigned to {assignedOwner}
          </p>
          <Button
            variant="link"
            className="mt-3 h-auto p-0 text-xs font-medium text-[#7C3AED]"
            onClick={() => {
              setResponseText("")
              setResult(null)
              setError("")
            }}
          >
            Clear
          </Button>
        </div>
      ) : null}

      {items.length ? (
        <div className="space-y-3 pt-2">
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
      ) : null}
    </div>
  )
}

export function TriagePanel({
  customer,
  items,
  onSelectCustomer,
  onSend,
  onRegenerate,
  onSubmitTriage,
}: {
  customer: CustomerAccount
  items: TriageItem[]
  onSelectCustomer: (customerId: string) => void
  onSend: (channel: Channel, message: string) => Promise<void>
  onRegenerate: (channel: Channel) => Promise<string>
  onSubmitTriage: (invoiceId: string, responseText: string) => Promise<TriageResult>
}) {
  const [pendingCount, setPendingCount] = useState(items.length || 3)
  const [activeTab, setActiveTab] = useState<"composer" | "feed" | "triage">("composer")

  return (
    <div className="flex max-h-[760px] flex-col overflow-y-auto rounded-2xl bg-white p-5 card-shadow">
      <div className="flex border-b border-[#E5E7EB]">
        <button
          type="button"
          onClick={() => setActiveTab("composer")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            activeTab === "composer"
              ? "border-[#7C3AED] text-[#7C3AED]"
              : "border-transparent text-[#6B7280] hover:text-[#111827]"
          )}
        >
          AI Composer
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("feed")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            activeTab === "feed"
              ? "border-[#7C3AED] text-[#7C3AED]"
              : "border-transparent text-[#6B7280] hover:text-[#111827]"
          )}
        >
          Track Feed
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("triage")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            activeTab === "triage"
              ? "border-[#7C3AED] text-[#7C3AED]"
              : "border-transparent text-[#6B7280] hover:text-[#111827]"
          )}
        >
          Response Triage
          {pendingCount > 0 ? (
            <span className="rounded-full bg-[#D1FAE5] px-2 py-0.5 text-[11px] font-medium text-[#065F46]">
              {pendingCount} new
            </span>
          ) : null}
        </button>
      </div>

      <div className="mt-5">
        {activeTab === "composer" ? (
          <ComposerPanel customer={customer} onRegenerate={onRegenerate} onSend={onSend} />
        ) : null}

        {activeTab === "feed" ? (
          <TrackFeed items={customer.trackFeed} />
        ) : null}

        {activeTab === "triage" ? (
          <ResponseTriageTab
            customer={customer}
            items={items}
            onSelectCustomer={onSelectCustomer}
            onSubmitTriage={async (invoiceId, responseText) => {
              const triageResult = await onSubmitTriage(invoiceId, responseText)
              setPendingCount(0)
              return triageResult
            }}
          />
        ) : null}
      </div>
    </div>
  )
}
