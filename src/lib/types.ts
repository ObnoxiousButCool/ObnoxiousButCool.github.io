export type AgingBucketType = "30-day bucket" | "45-day bucket" | "60+ days"
export type RiskLevel = "High Risk" | "Watch" | "Normal"
export type ModifierType = "penalty" | "incentive"
export type Channel = "Email" | "SMS" | "WhatsApp"
export type TriageClassification =
  | "Payment commitment"
  | "Disputed — task created"
  | "No response — flag updated"
export type TaskStatus = "Open" | "In Progress" | "Closed"
export type CloseOutcome = "Yes" | "No" | "Partial"

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
  reminderCount: number
  lastAction: string
  lastChannel: Channel
  responseHistory: string[]
  aiPriorityScore: number
  aiSummary: string
  draftMessage: string
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
}
