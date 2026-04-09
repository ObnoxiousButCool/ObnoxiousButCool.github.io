import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"
import { useCallback } from "react"
import {
  dispatchReminder,
  fetchInteractions,
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
  InteractionLog,
  ModifierType,
  QueueStat,
  RiskLevel,
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
  customers: CustomerAccount[]
  triageItems: TriageItem[]
  tasks: TaskItem[]
  isQueueLoading: boolean
  isTasksLoading: boolean
  isTriageLoading: boolean
  sendReminder: (customerId: string, channel: Channel, message: string) => void
  regenerateDraft: (customerId: string) => string
  createTask: (customerId: string) => void
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>
  closeTask: (taskId: string, outcome: CloseOutcome) => Promise<void>
  submitTriage: (invoiceId: string, responseText: string) => Promise<void>
  loadInteractions: (customerId: string) => Promise<void>
}

const DashboardStoreContext = createContext<DashboardStoreValue | null>(null)

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

function mapClassification(value: string): TriageClassification {
  const normalized = value.trim().toLowerCase()
  if (normalized.includes("commit")) {
    return "Commitment"
  }
  if (normalized.includes("disput")) {
    return "Disputed"
  }
  return "No response"
}

function mapTrackEventType(value: string): TrackEventType {
  const normalized = value.trim().toLowerCase()
  if (normalized.includes("reply")) {
    return "Reply Received"
  }
  if (normalized.includes("task")) {
    return "Task Created"
  }
  if (normalized.includes("flag")) {
    return "Flag Updated"
  }
  return "Reminder Sent"
}

function getModifierType(riskLevel: RiskLevel): ModifierType {
  return riskLevel === "Normal" ? "Incentive" : "Penalty"
}

function getModifierLabel(modifierType: ModifierType, riskScore: number) {
  if (modifierType === "Incentive") {
    return "-5% incentive"
  }

  return riskScore >= 80 ? "+12% penalty" : "+8% penalty"
}

function getModifierValue(modifierType: ModifierType, agingDays: number, invoiceId: string) {
  if (modifierType === "Incentive") {
    return `A -5% incentive can be applied if invoice ${invoiceId} is paid within ${Math.max(1, 45 - agingDays)} days.`
  }

  if (agingDays >= 60) {
    return `A +12% penalty is active for invoice ${invoiceId} until payment is completed.`
  }

  return `A +8% penalty will apply to invoice ${invoiceId} if the balance remains unpaid this cycle.`
}

function getStatusLabel(customer: QueueCustomer, profile?: RiskProfile) {
  if (profile?.defaulterFlag) {
    return "No Response"
  }
  if (customer.reminderSendToday) {
    return "Commitment"
  }
  return "Disputed"
}

function getLastAction(customer: QueueCustomer) {
  return customer.reminderSendToday ? "Reminder due today" : "Awaiting follow-up"
}

function getAiSummary(customer: QueueCustomer, profile?: RiskProfile) {
  const payerCategory = profile?.payerCategory || "payer"
  return `${customer.accountName} is ranked #${customer.queueRank} based on ${customer.agingDays} overdue days, ${formatCurrency(
    customer.outstanding
  )} outstanding, and ${payerCategory.toLowerCase()} risk signals.`
}

function toCustomerAccount(customer: QueueCustomer, profile?: RiskProfile): CustomerAccount {
  const riskLevel = profile?.riskLabel || customer.riskLabel
  const modifierType = getModifierType(riskLevel)
  const modifierValue = getModifierValue(modifierType, customer.agingDays, customer.invoiceId)

  return {
    id: customer.invoiceId,
    customerName: customer.accountName,
    accountRef: customer.invoiceId,
    payerType: profile?.payerCategory || "Unknown",
    agingDays: customer.agingDays,
    bucket: customer.agingBucket,
    outstanding: customer.outstanding,
    riskLevel,
    modifierType,
    modifierLabel: getModifierLabel(modifierType, profile?.riskScore ?? 0),
    modifierValue,
    statusLabel: getStatusLabel(customer, profile),
    reminderCount: 0,
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
      modifierValue,
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
    riskScore: profile?.riskScore,
    payerCategory: profile?.payerCategory,
    defaulterFlag: profile?.defaulterFlag,
    writeoffRate: profile?.writeoffRate,
    partialRate: profile?.partialRate,
    recoveryRate: profile?.recoveryRate,
    avgDaysLate: profile?.avgDaysLate,
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
        const [queue, profiles] = await Promise.all([fetchQueue(), fetchProfiles()])
        if (!isMounted) {
          return
        }

        const profilesByAccount = new Map(profiles.map((profile) => [profile.accountName, profile]))
        setCustomers(queue.map((item) => toCustomerAccount(item, profilesByAccount.get(item.accountName))))
      } catch {
        if (isMounted) {
          setCustomers([])
          toast.error("Failed to load queue")
        }
      } finally {
        if (isMounted) {
          setIsQueueLoading(false)
        }
      }
    }

    const loadOpenTasks = async () => {
      setIsTasksLoading(true)

      try {
        const openTasks = await fetchTasks()
        if (isMounted) {
          setTasks(openTasks)
        }
      } catch {
        if (isMounted) {
          setTasks([])
          toast.error("Failed to load tasks")
        }
      } finally {
        if (isMounted) {
          setIsTasksLoading(false)
        }
      }
    }

    void Promise.allSettled([loadCustomers(), loadOpenTasks()])

    return () => {
      isMounted = false
    }
  }, [])

  const queueStats = useMemo<QueueStat[]>(() => {
    const totalOutstanding = customers.reduce((sum, customer) => sum + customer.outstanding, 0)
    const remindersDueToday = customers.filter((customer) => customer.reminderSendToday).length
    const avgAging =
      customers.length > 0
        ? Math.round(customers.reduce((sum, customer) => sum + customer.agingDays, 0) / customers.length)
        : 0
    const highRiskCount = customers.filter((customer) => customer.riskLevel === "High Risk").length

    return [
      {
        label: "Total outstanding",
        value: formatCurrency(totalOutstanding),
        detail: "Live backend data",
        delta: `${customers.length} accounts`,
      },
      {
        label: "Active defaulters",
        value: String(customers.length),
        detail: "Current queue",
        delta: `${highRiskCount} high-risk`,
      },
      {
        label: "Reminders sent today",
        value: String(remindersDueToday),
        detail: "Marked by backend",
        delta: `${tasks.length} open tasks`,
      },
      {
        label: "Avg days overdue",
        value: String(avgAging),
        detail: "Across queue",
        delta: customers.length ? "Live average" : "No accounts",
      },
    ]
  }, [customers, tasks.length])

  const createTask = () => {
    toast.info("Manual task creation is not available on the live backend")
  }

  const loadInteractions = useCallback(async (customerId: string) => {
    try {
      const interactions = await fetchInteractions(customerId)
      const trackFeed = interactions.map(toTrackEvent)

      setCustomers((current) =>
        current.map((customer) =>
          customer.id === customerId ? { ...customer, trackFeed } : customer
        )
      )
    } catch {
      toast.error("Failed to load interactions")
    }
  }, [])

  const sendReminder = (customerId: string, channel: Channel, message: string) => {
    void (async () => {
      try {
        const result = await dispatchReminder(customerId, channel, message)

        setCustomers((current) =>
          current.map((customer) =>
            customer.id === customerId
              ? {
                ...customer,
                reminderCount: customer.reminderCount + 1,
                lastAction: "Reminder sent just now",
                lastChannel: result.channelUsed,
                draftMessage: message,
                trackFeed: [
                  {
                    id: `track-${customerId}-${Date.now()}`,
                    timestamp: "Just now",
                    type: "Reminder Sent",
                    description: message,
                  },
                  ...customer.trackFeed,
                ],
              }
              : customer
          )
        )

        toast.success(`${result.channelUsed} reminder sent`)
      } catch {
        setCustomers((current) =>
          current.map((customer) =>
            customer.id === customerId
              ? {
                ...customer,
                lastChannel: channel,
                draftMessage: message,
              }
              : customer
          )
        )

        toast.error("Failed to send reminder")
      }
    })()
  }

  const regenerateDraft = (customerId: string) => {
    const currentDraft = customers.find((customer) => customer.id === customerId)?.draftMessage || ""

    void (async () => {
      try {
        const reminder = await generateReminder(customerId)

        setCustomers((current) =>
          current.map((customer) => {
            if (customer.id !== customerId) {
              return customer
            }

            const [latest, ...rest] = customer.trackFeed
            const nextTrackFeed: TrackEvent[] =
              latest && latest.type === "Reminder Sent"
                ? [{ ...latest, description: reminder.message }, ...rest]
                : [
                  {
                    id: `track-${customerId}-${Date.now()}`,
                    timestamp: "Just now",
                    type: "Reminder Sent",
                    description: reminder.message,
                  },
                  ...customer.trackFeed,
                ]

            return {
              ...customer,
              draftMessage: reminder.message,
              lastChannel: reminder.channel,
              trackFeed: nextTrackFeed,
            }
          })
        )

        toast.success("Draft regenerated")
      } catch {
        toast.error("Failed to regenerate draft")
      }
    })()

    return currentDraft
  }

  const refreshTasks = async () => {
    setIsTasksLoading(true)

    try {
      const refreshedTasks = await fetchTasks()
      setTasks(refreshedTasks)
    } catch {
      setTasks([])
      toast.error("Failed to load tasks")
    } finally {
      setIsTasksLoading(false)
    }
  }

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const updatedTask = await updateTask(taskId, status, "")
      setTasks((current) => current.map((task) => (task.id === taskId ? updatedTask : task)))
      toast.success("Task updated")
    } catch {
      toast.error("Failed to update task")
    }
  }

  const closeTask = async (taskId: string, _outcome: CloseOutcome) => {
    try {
      await updateTask(taskId, "closed", "Closed by user")
      setTasks((current) => current.filter((task) => task.id !== taskId))
      toast.success("Task closed")
    } catch {
      toast.error("Failed to close task")
    }
  }

  const submitTriage = async (invoiceId: string, responseText: string) => {
    setIsTriageLoading(true)

    try {
      const result = await submitTriageRequest(invoiceId, responseText)
      const customer = customers.find((entry) => entry.id === invoiceId)
      const triageItem = toTriageItem(result, customer)

      setTriageItems((current) => [triageItem, ...current.filter((item) => item.customerId !== invoiceId)])
      toast.success(`${result.category}: ${result.summary}`)

      if (result.taskCreated) {
        await refreshTasks()
      }
    } catch {
      toast.error("Failed to submit triage")
    } finally {
      setIsTriageLoading(false)
    }
  }

  return (
    <DashboardStoreContext.Provider
      value={{
        queueStats,
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
