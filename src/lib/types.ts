export type AgingBucketType = "30 days" | "45 days" | "60+ days"
export type RiskLevel = "High Risk" | "Watch" | "Normal"
export type ModifierType = "Penalty" | "Incentive"
export type Channel = "Email" | "SMS" | "WhatsApp"
export type TriageClassification = "Commitment" | "Disputed" | "No response"
export type TaskStatus = "Open" | "In Progress" | "Closed"
export type CloseOutcome = "Yes" | "No" | "Partial"
export type TrackEventType =
  | "Reminder Sent"
  | "Reply Received"
  | "Task Created"
  | "Flag Updated"

export interface TrackEvent {
  id: string
  timestamp: string
  type: TrackEventType
  description: string
}

export interface CustomerAccount {
  id: string
  customerName: string
  accountRef: string
  payerType: string
  agingDays: number
  bucket: AgingBucketType
  outstanding: number
  riskLevel: RiskLevel
  modifierType: ModifierType
  modifierLabel: string
  modifierValue: string
  statusLabel: string
  reminderCount: number
  lastAction: string
  lastChannel: Channel
  responseHistory: string[]
  aiPriorityScore: number
  aiSummary: string
  draftMessage: string
  creditsUsed: number
  trackFeed: TrackEvent[]
}

export interface TriageItem {
  id: string
  customerId: string
  customerName: string
  receivedAt: string
  rawReply: string
  classification: TriageClassification
  actionTaken: string
  followUp: string
}

export interface TaskItem {
  id: string
  customerId: string
  customerName: string
  taskType: string
  status: TaskStatus
  createdAt: string
  assignedTo: string
  notes: string
  auditTrail: string[]
}

export interface QueueStat {
  label: string
  value: string
  detail: string
  delta: string
}
