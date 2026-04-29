import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"
import { useCallback } from "react"
import {
  dispatchReminder,
  fetchBehavioralScorecards,
  fetchInteractions,
  fetchInterventionPlaybook,
  fetchProfiles,
  fetchQueue,
  fetchTasks,
  generateReminder,
  submitTriage as submitTriageRequest,
  updateTask,
  type QueueCustomer,
  type RiskProfile,
} from "@/lib/api"
import { buildMessageTemplate } from "@/lib/messageTemplate"
import type {
  Channel,
  CloseOutcome,
  CustomerAccount,
  AmountTierBreakdownItem,
  BehavioralScorecard,
  InteractionLog,
  QueueStat,
  TaskItem,
  TaskStatus,
  TrackEvent,
  TrackEventType,
  TriageClassification,
  TriageItem,
  TriageResult,
} from "@/lib/types"

interface DashboardStoreValue {
  queueStats: QueueStat[]
  amountBreakdown: AmountTierBreakdownItem[]
  customers: CustomerAccount[]
  triageItems: TriageItem[]
  tasks: TaskItem[]
  isQueueLoading: boolean
  isTasksLoading: boolean
  isTriageLoading: boolean
  sendReminder: (customerId: string, channel: Channel, message: string) => Promise<void>
  regenerateDraft: (customerId: string, channel?: Channel) => Promise<string>
  createTask: (customerId: string) => void
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>
  closeTask: (taskId: string, outcome: CloseOutcome) => Promise<void>
  submitTriage: (invoiceId: string, responseText: string) => Promise<TriageResult>
  loadInteractions: (customerId: string) => Promise<void>
  loadPlaybook: (customerId: string) => Promise<void>
}

const DashboardStoreContext = createContext<DashboardStoreValue | null>(null)

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

const amountTierLabels: AmountTierBreakdownItem["label"][] = ["<₹10K", "₹10K–₹50K", "₹50K–₹1L", ">₹1L"]

function amountTierFromOutstanding(value: number): AmountTierBreakdownItem["label"] {
  if (value > 100000) return ">₹1L"
  if (value > 50000) return "₹50K–₹1L"
  if (value >= 10000) return "₹10K–₹50K"
  return "<₹10K"
}

function mapClassification(value: string): TriageClassification {
  const normalized = value.trim().toLowerCase()
  if (normalized.includes("commit")) return "Commitment"
  if (normalized.includes("disput")) return "Disputed"
  return "No response"
}

function mapTrackEventType(value: string): TrackEventType {
  const normalized = value.trim().toLowerCase()
  if (normalized.includes("reply") || normalized.includes("response")) return "Reply Received"
  if (normalized.includes("task")) return "Task Created"
  if (normalized.includes("flag")) return "Flag Updated"
  return "Reminder Sent"
}

/**
 * ✅ NEW: Backend-driven modifier logic ONLY
 */
function getModifier(customer: QueueCustomer): { type: CustomerAccount["modifierType"]; label: string | null; value: string } {
  const penalty = Number(customer.penaltyAmount || 0)
  const incentive = Number(customer.incentiveAmount || 0)
  const outstanding = Number(customer.outstanding || 0)

  if (penalty > 0) {
    const percent = outstanding > 0 ? Math.round((penalty / outstanding) * 100) : 0
    return {
      type: "Penalty",
      label: `+${percent}% penalty`,
      value: customer.financialNote,
    }
  }

  if (incentive > 0) {
    const percent = outstanding > 0 ? Math.round((incentive / outstanding) * 100) : 0
    return {
      type: "Incentive",
      label: `-${percent}% incentive`,
      value: customer.financialNote,
    }
  }

  return {
    type: null,
    label: null,
    value: customer.financialNote,
  }
}

function getStatusLabel(customer: QueueCustomer, profile?: RiskProfile) {
  if (profile?.defaulterFlag) return "No Response"
  if (customer.reminderSendToday) return "Commitment"
  return "Disputed"
}

function getLastAction(customer: QueueCustomer) {
  if (customer.nextAction) return customer.nextAction
  if (customer.manualFollowUpRequired) return customer.reminderReason
  return customer.reminderSendToday ? "Reminder due today" : "Awaiting follow-up"
}

function getAiSummary(customer: QueueCustomer, profile?: RiskProfile) {
  const payerCategory = profile?.payerCategory || "payer"
  return `${customer.accountName} is ranked #${customer.queueRank} based on ${customer.agingDays} overdue days, ${formatCurrency(
    customer.outstanding
  )} outstanding, ${customer.amountTier} amount tier, and ${payerCategory.toLowerCase()} risk signals. Strategy: ${customer.reminderStrategy}.`
}

function toCustomerAccount(
  customer: QueueCustomer,
  profile?: RiskProfile,
  scorecard?: BehavioralScorecard
): CustomerAccount {
  const modifier = getModifier(customer)
  const riskLevel = profile?.riskLabel || customer.riskLabel

  return {
    id: customer.invoiceId,
    customerName: customer.accountName,
    accountRef: customer.invoiceId,
    payerType: profile?.payerCategory || "Unknown",
    agingDays: customer.agingDays,
    bucket: customer.agingBucket,
    outstanding: customer.outstanding,
    riskLevel,
    amountTier: customer.amountTier,
    reminderStrategy: customer.reminderStrategy,
    reminderStyle: customer.reminderStyle,
    maxReminders: customer.maxReminders,
    remindersSent: customer.remindersSent,
    reminderLimitReached: customer.reminderLimitReached,
    escalationThresholdDays: customer.escalationThresholdDays,
    escalationRequired: customer.escalationRequired,
    managerInvolvement: customer.managerInvolvement,
    cfoNotificationRequired: customer.cfoNotificationRequired,
    vipQueueEligible: customer.vipQueueEligible,
    automatedChannels: customer.automatedChannels,
    allowedChannels: customer.allowedChannels,
    playbookSteps: customer.playbookSteps,
    nextAction: customer.nextAction,
    manualFollowUpRequired: customer.manualFollowUpRequired,
    reminderReason: customer.reminderReason,

    // ✅ Backend-driven modifier
    modifierType: modifier.type,
    modifierLabel: modifier.label,
    modifierValue: modifier.value,

    statusLabel: getStatusLabel(customer, profile),
    reminderCount: customer.remindersSent,
    lastAction: getLastAction(customer),
    lastChannel: customer.nextReminderChannel || customer.recommendedChannel,
    responseHistory: [],
    aiPriorityScore: profile?.riskScore ?? Math.max(50, 100 - customer.queueRank),
    aiSummary: getAiSummary(customer, profile),

    draftMessage: buildMessageTemplate({
      customerName: customer.accountName,
      outstanding: customer.outstanding,
      accountRef: customer.invoiceId,
      agingDays: customer.agingDays,
      modifierValue: modifier.value || "No pricing adjustment is currently applied",
    }),

    creditsUsed: 0,
    trackFeed: [],
    invoiceId: customer.invoiceId,
    agingBucket: customer.agingBucket,
    netPayable: customer.netPayable,
    riskLabel: riskLevel,
    recommendedChannel: customer.recommendedChannel,
    reminderSendToday: customer.reminderSendToday,
    nextReminderChannel: customer.nextReminderChannel,
    incentiveApproved: customer.incentiveApproved,
    approvedDiscountPct: customer.approvedDiscountPct,
    approvedDiscountAmount: customer.approvedDiscountAmount,
    riskScore: profile?.riskScore,
    payerCategory: profile?.payerCategory,
    defaulterFlag: profile?.defaulterFlag,
    writeoffRate: profile?.writeoffRate,
    partialRate: profile?.partialRate,
    recoveryRate: profile?.recoveryRate,
    avgDaysLate: profile?.avgDaysLate,
    behavioralScorecard: scorecard,
  }
}

function toTrackEvent(interaction: InteractionLog): TrackEvent {
  return {
    id: interaction.id,
    timestamp: interaction.timestamp,
    type: mapTrackEventType(interaction.type),
    description: interaction.description,
  }
}

function toTriageItem(result: TriageResult, customer?: CustomerAccount): TriageItem {
  return {
    id: `triage-${result.invoiceId}-${Date.now()}`,
    customerId: result.invoiceId,
    customerName: customer?.customerName || result.invoiceId,
    receivedAt: "Just now",
    rawReply: result.summary,
    classification: mapClassification(result.category),
    actionTaken: JSON.stringify(result.triageAction),
    followUp: result.summary,
  }
}

function upsertTask(tasks: TaskItem[], task: TaskItem) {
  const exists = tasks.some((item) => item.id === task.id)
  return exists
    ? tasks.map((item) => (item.id === task.id ? task : item))
    : [task, ...tasks]
}

function mergeTasks(current: TaskItem[], incoming: TaskItem[]) {
  return incoming.reduce((next, task) => upsertTask(next, task), current)
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function DashboardStoreProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<CustomerAccount[]>([])
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [triageItems, setTriageItems] = useState<TriageItem[]>([])
  const [isQueueLoading, setIsQueueLoading] = useState(true)
  const [isTasksLoading, setIsTasksLoading] = useState(true)
  const [isTriageLoading, setIsTriageLoading] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadCustomers = async () => {
      setIsQueueLoading(true)

      try {
        const [queue, profiles, scorecards] = await Promise.all([
          fetchQueue(),
          fetchProfiles(),
          fetchBehavioralScorecards(),
        ])
        if (!isMounted) return

        const profilesByAccount = new Map(profiles.map((p) => [p.accountName, p]))
        const scorecardsByAccount = new Map(scorecards.map((item) => [item.accountName, item]))
        setCustomers(
          queue.map((item) =>
            toCustomerAccount(
              item,
              profilesByAccount.get(item.accountName),
              scorecardsByAccount.get(item.accountName)
            )
          )
        )
      } catch {
        if (isMounted) {
          setCustomers([])
          toast.error("Failed to load queue")
        }
      } finally {
        if (isMounted) setIsQueueLoading(false)
      }
    }

    const loadOpenTasks = async () => {
      setIsTasksLoading(true)
      try {
        const openTasks = await fetchTasks()
        if (isMounted) setTasks(openTasks)
      } catch {
        if (isMounted) {
          setTasks([])
          toast.error("Failed to load tasks")
        }
      } finally {
        if (isMounted) setIsTasksLoading(false)
      }
    }

    void Promise.allSettled([loadCustomers(), loadOpenTasks()])

    return () => {
      isMounted = false
    }
  }, [])

  const queueStats = useMemo<QueueStat[]>(() => {
    const totalOutstanding = customers.reduce((sum, c) => sum + c.outstanding, 0)
    const remindersDueToday = customers.filter((c) => c.reminderSendToday).length
    const avgAging = customers.length
      ? Math.round(customers.reduce((sum, c) => sum + c.agingDays, 0) / customers.length)
      : 0
    const highRiskCount = customers.filter((c) => c.riskLevel === "High Risk").length

    return [
      { label: "Total outstanding", value: formatCurrency(totalOutstanding), detail: "Live backend data", delta: `${customers.length} accounts` },
      { label: "Active defaulters", value: String(customers.length), detail: "Current queue", delta: `${highRiskCount} high-risk` },
      { label: "Reminders sent today", value: String(remindersDueToday), detail: "Marked by backend", delta: `${tasks.length} open tasks` },
      { label: "Avg days overdue", value: String(avgAging), detail: "Across queue", delta: customers.length ? "Live average" : "No accounts" },
    ]
  }, [customers, tasks.length])

  const amountBreakdown = useMemo<AmountTierBreakdownItem[]>(() => {
    const totalOutstanding = customers.reduce((sum, customer) => sum + customer.outstanding, 0)

    return amountTierLabels.map((label) => {
      const tierCustomers = customers.filter((customer) => (customer.amountTier || amountTierFromOutstanding(customer.outstanding)) === label)
      const tierOutstanding = tierCustomers.reduce((sum, customer) => sum + customer.outstanding, 0)

      return {
        label,
        value: formatCurrency(tierOutstanding),
        percentage: totalOutstanding ? Math.round((tierOutstanding / totalOutstanding) * 100) : 0,
        count: tierCustomers.length,
      }
    })
  }, [customers])

  const createTask = () => {
    toast.info("Manual task creation is not available on the live backend")
  }

  const loadInteractions = useCallback(async (customerId: string) => {
    try {
      const interactions = await fetchInteractions(customerId)
      const trackFeed = interactions.map(toTrackEvent)

      setCustomers((current) =>
        current.map((c) => (c.id === customerId ? { ...c, trackFeed } : c))
      )
    } catch {
      toast.error("Failed to load interactions")
    }
  }, [])

  const sendReminder = async (customerId: string, channel: Channel, message: string) => {
    try {
      const result = await dispatchReminder(customerId, channel, message)

      setCustomers((current) =>
        current.map((c) =>
          c.id === customerId
            ? {
                ...c,
                reminderCount: c.reminderCount + 1,
                remindersSent: (c.remindersSent || c.reminderCount) + 1,
                lastAction: "Reminder sent just now",
                lastChannel: result.channelUsed,
                draftMessage: message,
              }
            : c
        )
      )

      toast.success(`${result.channelUsed} reminder sent`)
    } catch (error) {
      toast.error(errorMessage(error, "Failed to send reminder"))
    }
  }

  const regenerateDraft = useCallback(async (customerId: string, channel?: Channel) => {
    const currentDraft = customers.find((c) => c.id === customerId)?.draftMessage || ""

    try {
      const reminder = await generateReminder(customerId, channel)

      setCustomers((current) =>
        current.map((c) =>
          c.id === customerId
            ? { ...c, draftMessage: reminder.message, lastChannel: reminder.channel }
            : c
        )
      )

      toast.success("Draft regenerated")
      return reminder.message
    } catch (error) {
      toast.error(errorMessage(error, "Failed to regenerate draft"))
      return currentDraft
    }
  }, [customers])

  const updateTaskStatus = useCallback(async (taskId: string, status: TaskStatus) => {
    try {
      const task = await updateTask(taskId, status)
      setTasks((current) => upsertTask(current, task))
      toast.success(`Task moved to ${status}`)
    } catch (error) {
      toast.error(errorMessage(error, "Failed to update task"))
    }
  }, [])

  const loadPlaybook = useCallback(async (customerId: string) => {
    try {
      const interventionPlaybook = await fetchInterventionPlaybook(customerId)

      setCustomers((current) =>
        current.map((c) => (c.id === customerId ? { ...c, interventionPlaybook } : c))
      )
    } catch {
      toast.error("Failed to load intervention playbook")
    }
  }, [])

  const closeTask = useCallback(async (taskId: string, outcome: CloseOutcome) => {
    const outcomeNotes: Record<CloseOutcome, string> = {
      Yes: "Payment received; task closed.",
      No: "Closed without payment confirmation.",
      Partial: "Partial payment received; task closed for finance review.",
    }

    try {
      const task = await updateTask(taskId, "Closed", outcomeNotes[outcome])
      setTasks((current) => upsertTask(current, task))
      toast.success("Task closed")
    } catch (error) {
      toast.error(errorMessage(error, "Failed to close task"))
    }
  }, [])

  const submitTriage = useCallback(async (invoiceId: string, responseText: string) => {
    setIsTriageLoading(true)
    try {
      const result = await submitTriageRequest(invoiceId, responseText)
      const customer = customers.find((item) => item.id === invoiceId)
      setTriageItems((current) => [toTriageItem(result, customer), ...current])

      if (result.taskCreated) {
        const openTasks = await fetchTasks()
        setTasks((current) => mergeTasks(current, openTasks))
      }

      toast.success("Response triaged")
      return result
    } catch (error) {
      toast.error(errorMessage(error, "Failed to triage response"))
      throw error
    } finally {
      setIsTriageLoading(false)
    }
  }, [customers])

  return (
    <DashboardStoreContext.Provider
      value={{
        queueStats,
        amountBreakdown,
        customers,
        triageItems,
        tasks,
        isQueueLoading,
        isTasksLoading,
        isTriageLoading,
        sendReminder,
        regenerateDraft,
        createTask,
        updateTaskStatus,
        closeTask,
        submitTriage,
        loadInteractions,
        loadPlaybook,
      }}
    >
      {children}
    </DashboardStoreContext.Provider>
  )
}

export function useDashboardStore() {
  const context = useContext(DashboardStoreContext)
  if (!context) {
    throw new Error("useDashboardStore must be used within DashboardStoreProvider")
  }
  return context
}
