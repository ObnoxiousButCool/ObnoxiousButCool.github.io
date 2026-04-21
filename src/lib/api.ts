import type {
  AgingBucketType,
  Channel,
  InteractionLog,
  RiskLevel,
  TaskItem,
  TaskStatus,
  TriageResult,
} from "@/lib/types"

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:8000"

interface QueueApiResponse {
  queue_rank: number
  invoice_id: string
  account_name: string
  aging_bucket: string
  aging_days: number
  outstanding: number
  net_payable: number
  risk_label: string
  recommended_channel: string
  reminder_send_today: boolean
  next_reminder_channel: string
}

interface ProfileApiResponse {
  account_name: string
  payer_category: string
  risk_score: number
  risk_label: string
  defaulter_flag: boolean
  writeoff_rate: number
  partial_rate: number
  recovery_rate: number
  avg_days_late: number
}

interface TaskApiResponse {
  task_id: string
  invoice_id: string
  account_name: string
  task_type: string
  status: string
  assigned_to: string
  created_date: string
  due_date: string
  escalation_flag: boolean
  audit_log: string[]
}

interface ReminderApiResponse {
  invoice_id: string
  channel: string
  ai_recommended_channel: string   // ← new: what AI suggests
  message: string
}

interface TriageApiResponse {
  invoice_id: string
  category: string
  summary: string
  triage_action: Record<string, unknown>
  task_created: boolean
}

interface DispatchApiResponse {
  invoice_id: string
  success: boolean
  channel_requested: string
  channel_used: string
  fallback_used: boolean
  attempted_channels: string[]
  message_sid: string | null
}

export interface QueueCustomer {
  queueRank: number
  invoiceId: string
  accountName: string
  agingBucket: AgingBucketType
  agingDays: number
  outstanding: number
  netPayable: number
  riskLabel: RiskLevel
  recommendedChannel: Channel
  reminderSendToday: boolean
  nextReminderChannel: Channel
}

export interface RiskProfile {
  accountName: string
  payerCategory: string
  riskScore: number
  riskLabel: RiskLevel
  defaulterFlag: boolean
  writeoffRate: number
  partialRate: number
  recoveryRate: number
  avgDaysLate: number
}

export interface ReminderDraft {
  invoiceId: string
  channel: Channel               // channel the message was generated for (user's choice)
  aiRecommendedChannel: Channel  // ← new: AI's suggestion, shown as badge in UI
  message: string
}

export interface DispatchResult {
  invoiceId: string
  success: boolean
  channelRequested: Channel
  channelUsed: Channel
  fallbackUsed: boolean
  attemptedChannels: Channel[]
  messageSid: string | null
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

function normalizeAgingBucket(value: string): AgingBucketType {
  const normalized = value.trim().toLowerCase()
  if (normalized.includes("60")) {
    return "60+ days"
  }
  if (normalized.includes("45")) {
    return "45 days"
  }
  return "30 days"
}

function normalizeRiskLevel(value: string): RiskLevel {
  const normalized = value.trim().toLowerCase()
  if (normalized.includes("high")) {
    return "High Risk"
  }
  if (normalized.includes("watch")) {
    return "Watch"
  }
  return "Normal"
}

function normalizeChannel(value: string): Channel {
  const normalized = value.trim().toLowerCase()
  if (normalized === "sms") {
    return "SMS"
  }
  if (normalized === "whatsapp") {
    return "WhatsApp"
  }
  return "Email"
}

function normalizeTaskStatus(value: string): TaskStatus {
  const normalized = value.trim().toLowerCase()
  if (normalized === "in progress") {
    return "In Progress"
  }
  if (normalized === "closed") {
    return "Closed"
  }
  return "Open"
}

function mapQueueItem(item: QueueApiResponse): QueueCustomer {
  return {
    queueRank: item.queue_rank,
    invoiceId: item.invoice_id,
    accountName: item.account_name,
    agingBucket: normalizeAgingBucket(item.aging_bucket),
    agingDays: item.aging_days,
    outstanding: item.outstanding,
    penaltyAmount: item.penalty_amount,
    incentiveAmount: item.incentive_amount,
    financialNote: item.financial_note,
    netPayable: item.net_payable,
    riskLabel: normalizeRiskLevel(item.risk_label),
    recommendedChannel: normalizeChannel(item.recommended_channel),
    reminderSendToday: item.reminder_send_today,
    nextReminderChannel: normalizeChannel(item.next_reminder_channel),
  }
}

function mapProfile(item: ProfileApiResponse): RiskProfile {
  return {
    accountName: item.account_name,
    payerCategory: item.payer_category,
    riskScore: item.risk_score,
    riskLabel: normalizeRiskLevel(item.risk_label),
    defaulterFlag: item.defaulter_flag,
    writeoffRate: item.writeoff_rate,
    partialRate: item.partial_rate,
    recoveryRate: item.recovery_rate,
    avgDaysLate: item.avg_days_late,
  }
}

function mapTask(item: TaskApiResponse): TaskItem {
  const normalizedStatus = normalizeTaskStatus(item.status)

  return {
    id: item.task_id,
    taskId: item.task_id,
    customerId: item.invoice_id,
    invoiceId: item.invoice_id,
    customerName: item.account_name,
    taskType: item.task_type,
    status: normalizedStatus,
    createdAt: item.created_date,
    createdDate: item.created_date,
    assignedTo: item.assigned_to,
    dueDate: item.due_date,
    escalationFlag: item.escalation_flag,
    notes: item.audit_log[item.audit_log.length - 1] || "No notes available.",
    auditTrail: item.audit_log,
    auditLog: item.audit_log,
  }
}

function mapReminder(item: ReminderApiResponse): ReminderDraft {
  return {
    invoiceId: item.invoice_id,
    channel: normalizeChannel(item.channel),
    aiRecommendedChannel: normalizeChannel(item.ai_recommended_channel),
    message: item.message,
  }
}

function mapTriageResult(item: TriageApiResponse): TriageResult {
  return {
    invoiceId: item.invoice_id,
    category: item.category,
    summary: item.summary,
    triageAction: item.triage_action,
    taskCreated: item.task_created,
  }
}

function mapDispatchResult(item: DispatchApiResponse): DispatchResult {
  return {
    invoiceId: item.invoice_id,
    success: item.success,
    channelRequested: normalizeChannel(item.channel_requested),
    channelUsed: normalizeChannel(item.channel_used),
    fallbackUsed: item.fallback_used,
    attemptedChannels: item.attempted_channels.map(normalizeChannel),
    messageSid: item.message_sid,
  }
}

function mapInteraction(item: Record<string, unknown>, index: number): InteractionLog {
  const fallbackId = `interaction-${index}-${String(item.invoice_id ?? item.id ?? "entry")}`
  const timestamp = String(item.timestamp ?? item.created_at ?? item.date ?? item.logged_at ?? "Unknown")
  const description = String(item.message ?? item.description ?? item.summary ?? item.note ?? "Activity logged")
  const eventType = String(item.type ?? item.event_type ?? item.channel ?? item.status ?? "Flag Updated")

  return {
    id: String(item.id ?? fallbackId),
    timestamp,
    type: eventType,
    description,
    channel: item.channel ? String(item.channel) : undefined,
    actor: item.actor ? String(item.actor) : undefined,
    status: item.status ? String(item.status) : undefined,
    raw: item,
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  })

  const contentType = response.headers.get("content-type") || ""
  const isJson = contentType.includes("application/json")
  const payload = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    console.log("RAW BODY:", options.body)
    const message =
      typeof payload === "string"
        ? payload || response.statusText
        : String(
          (payload as { message?: unknown; detail?: unknown }).message ??
          (payload as { detail?: unknown }).detail ??
          response.statusText
        )

    throw new ApiError(response.status, message)
  }

  return payload as T
}

export async function fetchQueue() {
  const data = await apiFetch<QueueApiResponse[]>("/api/queue")
  return data.map(mapQueueItem)
}

export async function fetchProfiles() {
  const data = await apiFetch<ProfileApiResponse[]>("/api/profiles")
  return data.map(mapProfile)
}

export async function fetchTasks() {
  const data = await apiFetch<TaskApiResponse[]>("/api/tasks")
  return data.map(mapTask)
}

export async function updateTask(id: string, status: string, note?: string) {
  const data = await apiFetch<TaskApiResponse>(`/api/tasks/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ status, note }),
  })

  return mapTask(data)
}

// Pass user's chosen channel to backend so message is generated for that channel.
// Backend will also return aiRecommendedChannel separately for UI badge display.
export async function generateReminder(invoiceId: string, userChannel?: Channel) {
  const body: Record<string, string> = { invoice_id: invoiceId }
  if (userChannel) {
    body.channel = userChannel
  }

  const data = await apiFetch<ReminderApiResponse>("/api/reminders/generate", {
    method: "POST",
    body: JSON.stringify(body),
  })

  return mapReminder(data)
}

export async function dispatchReminder(customerId: string, channel: Channel, message: string) {
  console.log("ARGS:", { customerId, channel, message })
  const data = await apiFetch<DispatchApiResponse>("/api/dispatch", {
    method: "POST",
    body: JSON.stringify({ customerId, channel, message }),
  })

  return mapDispatchResult(data)
}

export async function submitTriage(invoiceId: string, responseText: string) {
  const data = await apiFetch<TriageApiResponse>("/api/triage", {
    method: "POST",
    body: JSON.stringify({ invoice_id: invoiceId, response_text: responseText }),
  })

  return mapTriageResult(data)
}

export async function fetchInteractions(invoiceId: string) {
  const data = await apiFetch<Record<string, unknown>[]>(`/api/interactions/${encodeURIComponent(invoiceId)}`)
  return data.map(mapInteraction)
}