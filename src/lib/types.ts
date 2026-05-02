export type AgingBucketType = "30 days" | "45 days" | "60+ days"
export type RiskLevel = "High Risk" | "Watch" | "Normal"
export type ModifierType = "Penalty" | "Incentive"
export type Channel = "Email" | "SMS" | "WhatsApp"
export type RewardTier = "Gold" | "Silver" | "Bronze" | "None"
export type AmountTier = "<₹10K" | "₹10K–₹50K" | "₹50K–₹1L" | ">₹1L"
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
  amountTier?: AmountTier
  reminderStrategy?: string
  reminderStyle?: string
  maxReminders?: number
  remindersSent?: number
  reminderLimitReached?: boolean
  escalationThresholdDays?: number
  escalationRequired?: boolean
  managerInvolvement?: boolean
  cfoNotificationRequired?: boolean
  vipQueueEligible?: boolean
  automatedChannels?: Channel[]
  allowedChannels?: string[]
  playbookSteps?: string[]
  nextAction?: string
  manualFollowUpRequired?: boolean
  reminderReason?: string
  modifierType: ModifierType | null
  modifierLabel: string | null
  modifierValue: string
  statusLabel: string
  reminderCount: number
  lastAction: string
  lastChannel: string
  responseHistory: string[]
  aiPriorityScore: number
  aiSummary: string
  draftMessage: string
  creditsUsed: number
  trackFeed: TrackEvent[]
  invoiceId?: string
  agingBucket?: AgingBucketType
  netPayable?: number
  riskLabel?: RiskLevel
  recommendedChannel?: string
  reminderSendToday?: boolean
  nextReminderChannel?: string
  incentiveApproved?: boolean | number
  approvedDiscountPct?: number
  approvedDiscountAmount?: number
  rewardRebatePct?: number
  rewardTier?: RewardTier | ""
  riskScore?: number
  payerCategory?: string
  defaulterFlag?: boolean
  writeoffRate?: number
  partialRate?: number
  recoveryRate?: number
  avgDaysLate?: number
  behavioralScorecard?: BehavioralScorecard
  interventionPlaybook?: InterventionPlaybook
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
  taskId?: string
  invoiceId?: string
  createdDate?: string
  dueDate?: string
  escalationFlag?: boolean
  auditLog?: string[]
}

export interface QueueStat {
  label: string
  value: string
  detail: string
  delta: string
}

export interface AmountTierBreakdownItem {
  label: AmountTier
  value: string
  percentage: number
  count: number
}

export type CfoConfidenceBucket = "High Confidence" | "Medium Confidence" | "Low Confidence"

export interface CfoForecastBucket {
  amount: number
  weightedAmount: number
  count: number
}

export interface CfoForecastWindow {
  days: number
  windowEnd: string
  weightedTotal: number
  buckets: Record<CfoConfidenceBucket, CfoForecastBucket>
}

export interface CfoScenario {
  days: number
  bestCase: number
  expected: number
  worstCase: number
}

export interface CfoPayerPrediction {
  accountName: string
  outstanding: number
  paymentProbability: number
  historicalAvgDaysToPay: number
  expectedDate: string
  summary: string
}

export interface CfoIncentiveApproval {
  invoiceId: string
  accountName: string
  outstanding: number
  paymentProbability: number
  discountPercent: number
  incentiveAmount: number
  status: string
  approvedBy: string | null
  approvedAt: string | null
  recommendation: string
}

export interface CfoInvoicePrediction {
  invoiceId: string
  accountName: string
  payerCategory: string
  outstanding: number
  agingDays: number
  paymentProbability: number
  confidenceBucket: CfoConfidenceBucket
  expectedDate: string
  historicalAvgDaysToPay: number
  weightedAmount: number
  latestResponseClassification: string
  remindersSent: number
}

export interface CfoForecast {
  asOf: string
  forecasts: {
    next7Days: CfoForecastWindow
    next30Days: CfoForecastWindow
  }
  payerPredictions: CfoPayerPrediction[]
  scenarios: {
    next7Days: CfoScenario
    next30Days: CfoScenario
  }
  incentiveApprovals: CfoIncentiveApproval[]
  predictions: CfoInvoicePrediction[]
}

export interface CfoApprovalResult {
  invoiceId: string
  accountName: string
  discountPercent: number
  incentiveAmount: number
  status: string
  approvedBy: string
  approvedAt: string
}

export interface DsoBottleneckStage {
  key: string
  stage: string
  averageDays: number
  impactLevel: "High" | "Medium" | "Low"
  description: string
}

export interface DsoRecommendation {
  targetStage: string
  currentDays: number
  reductionDays: number
  projectedDso: number
  fasterCashFlow: number
  narrative: string
}

export interface DsoProcessMetric {
  transition: string
  averageDays: number
  observedCount: number
  benchmarkDays: number
  source: "Observed" | "Modeled"
  status: "On Track" | "Needs Attention"
}

export interface DsoAnalytics {
  asOf: string
  currentDso: number
  lastMonthDso: number
  trendDays: number
  trendDirection: "Up" | "Down" | "Flat"
  totalAccountsReceivable: number
  averageDailySales: number
  trailingSales: number
  bottleneckStages: DsoBottleneckStage[]
  recommendation: DsoRecommendation
  processEfficiency: DsoProcessMetric[]
  dataNotes: string[]
}

export interface BehavioralScorecard {
  accountName: string
  payerCategory: string
  averageDaysToPay: number
  ignoredReminders: number
  observedReminders: number
  totalOutstandingBalance: number
  preferredChannel: Channel
  bestSendDay: string
  bestSendTimeWindow: string
  fallbackLayer: "Vendor-specific history" | "Segment-level pattern" | "Global hospital trend"
  vendorHistoryCount: number
  manualReviewRequired: boolean
  isNewAccount: boolean
  note: string
}

export interface PayerReward {
  id?: number
  accountName: string
  totalInvoices: number
  onTimePayments: number
  earlyPayments: number
  onTimeRate: number
  tier: RewardTier
  rebatePct: number
  rewardLabel: string
  tierUpdatedAt: string | null
  atRiskOfDowngrade: boolean
}

export interface InterventionPlaybookStep {
  action: string
  channel: string
  timing: string
  estimatedSuccessProbability: number
  requiresApproval: boolean
  automationLevel: "Automated" | "Manual approval"
  rationale: string
}

export interface InterventionPlaybook {
  invoiceId: string
  accountName: string
  modelName: string
  sourceMode: string
  generatedAt: string
  similarCaseBasis: string
  steps: InterventionPlaybookStep[]
  approvalSummary: {
    automatedSteps: number
    manualSteps: number
  }
}

export interface IngestionIssue {
  rowNumber: number
  invoiceId: string | null
  issues: string[]
}

export interface IngestionPreview {
  previewId: string
  filename: string
  sourceMode: string
  mapping: Record<string, string>
  previewRows: Record<string, string | number | boolean | null>[]
  summary: {
    totalRows: number
    validRows: number
    invalidRows: number
    duplicateRows: number
    existingDuplicates: number
  }
  issues: IngestionIssue[]
  requiredFields: string[]
}

export interface IngestionConfirmResult {
  previewId: string
  filename: string
  sourceMode: string
  importedRows: number
  skippedRows: number
  validRows: number
  invalidRows: number
}

export interface TriageResult {
  invoiceId: string
  category: string
  summary: string
  triageAction: Record<string, unknown>
  taskCreated: boolean
}

export interface InteractionLog {
  id: string
  timestamp: string
  type: string
  description: string
  channel?: string
  actor?: string
  status?: string
  raw?: Record<string, unknown>
}
