import { createContext, useContext, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { customerAccounts, queueStats, tasks as initialTasks, triageFeed } from "@/lib/mock-data"
import type {
  Channel,
  CloseOutcome,
  QueueStat,
  CustomerAccount,
  TaskItem,
  TaskStatus,
  TriageItem,
} from "@/lib/types"

interface DashboardStoreValue {
  queueStats: QueueStat[]
  customers: CustomerAccount[]
  triageItems: TriageItem[]
  tasks: TaskItem[]
  sendReminder: (customerId: string, channel: Channel, message: string) => void
  regenerateDraft: (customerId: string) => string
  createTask: (customerId: string) => void
  updateTaskStatus: (taskId: string, status: TaskStatus) => void
  closeTask: (taskId: string, outcome: CloseOutcome) => void
}

const DashboardStoreContext = createContext<DashboardStoreValue | null>(null)

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function DashboardStoreProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState(customerAccounts)
  const [tasks, setTasks] = useState(initialTasks)
  const triageItems = triageFeed

  const sendReminder = (customerId: string, channel: Channel, message: string) => {
    const customer = customers.find((entry) => entry.id === customerId)
    if (!customer) {
      return
    }

    setCustomers((current) =>
      current.map((entry) =>
        entry.id === customerId
          ? {
              ...entry,
              reminderCount: entry.reminderCount + 1,
              lastAction: `Sent via ${channel} just now`,
              lastChannel: channel,
              draftMessage: message,
            }
          : entry
      )
    )

    toast.success(`Sent to ${customer.customerName}`)
  }

  const regenerateDraft = (customerId: string) => {
    const customer = customers.find((entry) => entry.id === customerId)
    if (!customer) {
      return ""
    }

    const regenerated = `${customer.draftMessage} Please reply with your expected payment date today so we can update the account appropriately.`

    setCustomers((current) =>
      current.map((entry) =>
        entry.id === customerId ? { ...entry, draftMessage: regenerated } : entry
      )
    )

    toast.info("AI draft refreshed")
    return regenerated
  }

  const createTask = (customerId: string) => {
    const customer = customers.find((entry) => entry.id === customerId)
    if (!customer) {
      return
    }

    const openTaskExists = tasks.some(
      (task) => task.customerId === customerId && task.status !== "Closed"
    )

    if (openTaskExists) {
      toast.info("Open task already exists for this account")
      return
    }

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      customerId,
      customerName: customer.customerName,
      taskType: customer.riskLevel === "High Risk" ? "Manager escalation review" : "Dispute follow-up",
      status: "Open",
      createdAt: "Just now",
      assignedTo: "Finance Ops Executive",
      notes: `Created from queue action for ${customer.accountRef}. Review message context and reply history.`,
      auditTrail: [
        "Task created from queue action",
        `Outstanding balance: ${formatCurrency(customer.outstanding)}`,
      ],
    }

    setTasks((current) => [newTask, ...current])
    toast.success(`Task created for ${customer.customerName}`)
  }

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              auditTrail: [...task.auditTrail, `Status moved to ${status}`],
            }
          : task
      )
    )
  }

  const closeTask = (taskId: string, outcome: CloseOutcome) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "Closed",
              auditTrail: [...task.auditTrail, `Closed with outcome: ${outcome}`],
            }
          : task
      )
    )

    toast.success(`Task closed: ${outcome}`)
  }

  const value = {
    queueStats,
    customers,
    triageItems,
    tasks,
    sendReminder,
    regenerateDraft,
    createTask,
    updateTaskStatus,
    closeTask,
  }

  return (
    <DashboardStoreContext.Provider value={value}>
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
