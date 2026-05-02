import type {
  AgingBucketType,
  AmountTier,
  BehavioralScorecard,
  CfoApprovalResult,
  CfoConfidenceBucket,
  CfoForecast,
  CfoForecastBucket,
  CfoForecastWindow,
  CfoIncentiveApproval,
  CfoInvoicePrediction,
  CfoPayerPrediction,
  CfoScenario,
  Channel,
  DsoAnalytics,
  DsoBottleneckStage,
  DsoProcessMetric,
  DsoRecommendation,
  InteractionLog,
  IngestionConfirmResult,
  IngestionIssue,
  IngestionPreview,
  InterventionPlaybook,
  InterventionPlaybookStep,
  PayerReward,
  RiskLevel,
  RewardTier,
  TaskItem,
  TaskStatus,
  TriageResult,
} from "@/lib/types"

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "")

interface QueueApiResponse {
  queue_rank: number
  invoice_id: string
  account_name: string
  aging_bucket: string
  aging_days: number
  outstanding: number
  amount_tier: string
  incentive_amount: number
  penalty_amount: number
  net_payable: number
  financial_note: string
  risk_label: string
  recommended_channel: string
  reminder_strategy: string
  reminder_style: string
  max_reminders: number
  reminders_sent: number
  reminder_limit_reached: boolean
  escalation_threshold_days: number
  escalation_required: boolean
  manager_involvement: boolean
  cfo_notification_required: boolean
  vip_queue_eligible: boolean
  automated_channels: string[]
  allowed_channels: string[]
  playbook_steps: string[]
  next_action: string
  manual_follow_up_required: boolean
  reminder_reason: string
  reminder_send_today: boolean
  next_reminder_channel: string
  incentive_approved: number
  approved_discount_pct: number
  approved_discount_amount: number
  reward_rebate_pct: number
  reward_tier: string
}

interface PayerRewardApiResponse {
  id?: number
  account_name: string
  total_invoices: number
  on_time_payments: number
  early_payments: number
  on_time_rate: number
  tier: string
  rebate_pct: number
  reward_label: string
  tier_updated_at: string | null
  at_risk_of_downgrade: number | boolean
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
  recommended_channel: string
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

interface CfoForecastBucketApiResponse {
  amount: number
  weighted_amount: number
  count: number
}

interface CfoForecastWindowApiResponse {
  days: number
  window_end: string
  weighted_total: number
  buckets: Record<string, CfoForecastBucketApiResponse>
}

interface CfoScenarioApiResponse {
  days: number
  best_case: number
  expected: number
  worst_case: number
}

interface CfoPayerPredictionApiResponse {
  account_name: string
  outstanding: number
  payment_probability: number
  historical_avg_days_to_pay: number
  expected_date: string
  summary: string
}

interface CfoIncentiveApprovalApiResponse {
  invoice_id: string
  account_name: string
  outstanding: number
  payment_probability: number
  discount_percent: number
  incentive_amount: number
  status: string
  approved_by: string | null
  approved_at: string | null
  recommendation: string
}

interface CfoInvoicePredictionApiResponse {
  invoice_id: string
  account_name: string
  payer_category: string
  outstanding: number
  aging_days: number
  payment_probability: number
  confidence_bucket: string
  expected_date: string
  historical_avg_days_to_pay: number
  weighted_amount: number
  latest_response_classification: string
  reminders_sent: number
}

interface CfoForecastApiResponse {
  as_of: string
  forecasts: {
    next_7_days: CfoForecastWindowApiResponse
    next_30_days: CfoForecastWindowApiResponse
  }
  payer_predictions: CfoPayerPredictionApiResponse[]
  scenarios: {
    next_7_days: CfoScenarioApiResponse
    next_30_days: CfoScenarioApiResponse
  }
  incentive_approvals: CfoIncentiveApprovalApiResponse[]
  predictions: CfoInvoicePredictionApiResponse[]
}

interface CfoApprovalApiResponse {
  invoice_id: string
  account_name: string
  discount_percent: number
  incentive_amount: number
  status: string
  approved_by: string
  approved_at: string
}

interface DsoBottleneckStageApiResponse {
  key: string
  stage: string
  average_days: number
  impact_level: "High" | "Medium" | "Low"
  description: string
}

interface DsoRecommendationApiResponse {
  target_stage: string
  current_days: number
  reduction_days: number
  projected_dso: number
  faster_cash_flow: number
  narrative: string
}

interface DsoProcessMetricApiResponse {
  transition: string
  average_days: number
  observed_count: number
  benchmark_days: number
  source: "Observed" | "Modeled"
  status: "On Track" | "Needs Attention"
}

interface DsoAnalyticsApiResponse {
  as_of: string
  current_dso: number
  last_month_dso: number
  trend_days: number
  trend_direction: "Up" | "Down" | "Flat"
  total_accounts_receivable: number
  average_daily_sales: number
  trailing_sales: number
  bottleneck_stages: DsoBottleneckStageApiResponse[]
  recommendation: DsoRecommendationApiResponse
  process_efficiency: DsoProcessMetricApiResponse[]
  data_notes: string[]
}

interface BehavioralScorecardApiResponse {
  account_name: string
  payer_category: string
  average_days_to_pay: number
  ignored_reminders: number
  observed_reminders: number
  total_outstanding_balance: number
  preferred_channel: string
  best_send_day: string
  best_send_time_window: string
  fallback_layer: "Vendor-specific history" | "Segment-level pattern" | "Global hospital trend"
  vendor_history_count: number
  manual_review_required: boolean
  is_new_account: boolean
  note: string
}

interface InterventionPlaybookStepApiResponse {
  action: string
  channel: string
  timing: string
  estimated_success_probability: number
  requires_approval: boolean
  automation_level: "Automated" | "Manual approval"
  rationale: string
}

interface InterventionPlaybookApiResponse {
  invoice_id: string
  account_name: string
  model_name: string
  source_mode: string
  generated_at: string
  similar_case_basis: string
  steps: InterventionPlaybookStepApiResponse[]
  approval_summary: {
    automated_steps: number
    manual_steps: number
  }
}

interface IngestionIssueApiResponse {
  row_number: number
  invoice_id: string | null
  issues: string[]
}

interface IngestionPreviewApiResponse {
  preview_id: string
  filename: string
  source_mode: string
  mapping: Record<string, string>
  preview_rows: Record<string, string | number | boolean | null>[]
  summary: {
    total_rows: number
    valid_rows: number
    invalid_rows: number
    duplicate_rows: number
    existing_duplicates: number
  }
  issues: IngestionIssueApiResponse[]
  required_fields: string[]
}

interface IngestionConfirmApiResponse {
  preview_id: string
  filename: string
  source_mode: string
  imported_rows: number
  skipped_rows: number
  valid_rows: number
  invalid_rows: number
}

export interface QueueCustomer {
  queueRank: number
  invoiceId: string
  accountName: string
  agingBucket: AgingBucketType
  agingDays: number
  outstanding: number
  amountTier: AmountTier
  incentiveAmount: number
  penaltyAmount: number
  financialNote: string
  netPayable: number
  riskLabel: RiskLevel
  recommendedChannel: string
  reminderStrategy: string
  reminderStyle: string
  maxReminders: number
  remindersSent: number
  reminderLimitReached: boolean
  escalationThresholdDays: number
  escalationRequired: boolean
  managerInvolvement: boolean
  cfoNotificationRequired: boolean
  vipQueueEligible: boolean
  automatedChannels: Channel[]
  allowedChannels: string[]
  playbookSteps: string[]
  nextAction: string
  manualFollowUpRequired: boolean
  reminderReason: string
  reminderSendToday: boolean
  nextReminderChannel: string
  incentiveApproved: number
  approvedDiscountPct: number
  approvedDiscountAmount: number
  rewardRebatePct: number
  rewardTier: RewardTier | ""
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
  recommendedChannel: string
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
  if (normalized.includes("high") || normalized.includes("default")) {
    return "High Risk"
  }
  if (normalized.includes("watch") || normalized.includes("chronic") || normalized.includes("partial")) {
    return "Watch"
  }
  return "Normal"
}

function normalizeAmountTier(value: string): AmountTier {
  if (value.includes(">") && value.includes("1L")) return ">₹1L"
  if (value.includes("50K") && value.includes("1L")) return "₹50K–₹1L"
  if (value.includes("10K")) return "₹10K–₹50K"
  return "<₹10K"
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

function normalizeChannelList(values: string[] | undefined): Channel[] {
  return (values || []).map(normalizeChannel).filter((value, index, all) => all.indexOf(value) === index)
}

function normalizeRewardTier(value: string | undefined | null): RewardTier | "" {
  if (value === "Gold" || value === "Silver" || value === "Bronze" || value === "None") {
    return value
  }
  return ""
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
    amountTier: normalizeAmountTier(item.amount_tier),
    penaltyAmount: item.penalty_amount,
    incentiveAmount: item.incentive_amount,
    financialNote: item.financial_note,
    netPayable: item.net_payable,
    riskLabel: normalizeRiskLevel(item.risk_label),
    recommendedChannel: normalizeChannel(item.recommended_channel),
    reminderStrategy: item.reminder_strategy,
    reminderStyle: item.reminder_style,
    maxReminders: item.max_reminders,
    remindersSent: item.reminders_sent,
    reminderLimitReached: item.reminder_limit_reached,
    escalationThresholdDays: item.escalation_threshold_days,
    escalationRequired: item.escalation_required,
    managerInvolvement: item.manager_involvement,
    cfoNotificationRequired: item.cfo_notification_required,
    vipQueueEligible: item.vip_queue_eligible,
    automatedChannels: normalizeChannelList(item.automated_channels),
    allowedChannels: item.allowed_channels || [],
    playbookSteps: item.playbook_steps || [],
    nextAction: item.next_action,
    manualFollowUpRequired: item.manual_follow_up_required,
    reminderReason: item.reminder_reason,
    reminderSendToday: item.reminder_send_today,
    nextReminderChannel: item.next_reminder_channel,
    incentiveApproved: item.incentive_approved,
    approvedDiscountPct: item.approved_discount_pct,
    approvedDiscountAmount: item.approved_discount_amount,
    rewardRebatePct: item.reward_rebate_pct,
    rewardTier: normalizeRewardTier(item.reward_tier),
  }
}

function mapPayerReward(item: PayerRewardApiResponse): PayerReward {
  return {
    id: item.id,
    accountName: item.account_name,
    totalInvoices: item.total_invoices,
    onTimePayments: item.on_time_payments,
    earlyPayments: item.early_payments,
    onTimeRate: item.on_time_rate,
    tier: normalizeRewardTier(item.tier) || "None",
    rebatePct: item.rebate_pct,
    rewardLabel: item.reward_label,
    tierUpdatedAt: item.tier_updated_at,
    atRiskOfDowngrade: item.at_risk_of_downgrade === true || item.at_risk_of_downgrade === 1,
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
    recommendedChannel: item.recommended_channel,
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

function normalizeConfidenceBucket(value: string): CfoConfidenceBucket {
  if (value === "High Confidence" || value === "Medium Confidence" || value === "Low Confidence") {
    return value
  }
  return "Low Confidence"
}

function mapCfoForecastBucket(item: CfoForecastBucketApiResponse | undefined): CfoForecastBucket {
  return {
    amount: item?.amount ?? 0,
    weightedAmount: item?.weighted_amount ?? 0,
    count: item?.count ?? 0,
  }
}

function mapCfoForecastWindow(item: CfoForecastWindowApiResponse): CfoForecastWindow {
  const bucketNames: CfoConfidenceBucket[] = ["High Confidence", "Medium Confidence", "Low Confidence"]

  return {
    days: item.days,
    windowEnd: item.window_end,
    weightedTotal: item.weighted_total,
    buckets: bucketNames.reduce(
      (current, bucketName) => ({
        ...current,
        [bucketName]: mapCfoForecastBucket(item.buckets[bucketName]),
      }),
      {} as Record<CfoConfidenceBucket, CfoForecastBucket>
    ),
  }
}

function mapCfoScenario(item: CfoScenarioApiResponse): CfoScenario {
  return {
    days: item.days,
    bestCase: item.best_case,
    expected: item.expected,
    worstCase: item.worst_case,
  }
}

function mapCfoPayerPrediction(item: CfoPayerPredictionApiResponse): CfoPayerPrediction {
  return {
    accountName: item.account_name,
    outstanding: item.outstanding,
    paymentProbability: item.payment_probability,
    historicalAvgDaysToPay: item.historical_avg_days_to_pay,
    expectedDate: item.expected_date,
    summary: item.summary,
  }
}

function mapCfoIncentiveApproval(item: CfoIncentiveApprovalApiResponse): CfoIncentiveApproval {
  return {
    invoiceId: item.invoice_id,
    accountName: item.account_name,
    outstanding: item.outstanding,
    paymentProbability: item.payment_probability,
    discountPercent: item.discount_percent,
    incentiveAmount: item.incentive_amount,
    status: item.status,
    approvedBy: item.approved_by,
    approvedAt: item.approved_at,
    recommendation: item.recommendation,
  }
}

function mapCfoInvoicePrediction(item: CfoInvoicePredictionApiResponse): CfoInvoicePrediction {
  return {
    invoiceId: item.invoice_id,
    accountName: item.account_name,
    payerCategory: item.payer_category,
    outstanding: item.outstanding,
    agingDays: item.aging_days,
    paymentProbability: item.payment_probability,
    confidenceBucket: normalizeConfidenceBucket(item.confidence_bucket),
    expectedDate: item.expected_date,
    historicalAvgDaysToPay: item.historical_avg_days_to_pay,
    weightedAmount: item.weighted_amount,
    latestResponseClassification: item.latest_response_classification,
    remindersSent: item.reminders_sent,
  }
}

function mapCfoForecast(item: CfoForecastApiResponse): CfoForecast {
  return {
    asOf: item.as_of,
    forecasts: {
      next7Days: mapCfoForecastWindow(item.forecasts.next_7_days),
      next30Days: mapCfoForecastWindow(item.forecasts.next_30_days),
    },
    payerPredictions: item.payer_predictions.map(mapCfoPayerPrediction),
    scenarios: {
      next7Days: mapCfoScenario(item.scenarios.next_7_days),
      next30Days: mapCfoScenario(item.scenarios.next_30_days),
    },
    incentiveApprovals: item.incentive_approvals.map(mapCfoIncentiveApproval),
    predictions: item.predictions.map(mapCfoInvoicePrediction),
  }
}

function mapCfoApprovalResult(item: CfoApprovalApiResponse): CfoApprovalResult {
  return {
    invoiceId: item.invoice_id,
    accountName: item.account_name,
    discountPercent: item.discount_percent,
    incentiveAmount: item.incentive_amount,
    status: item.status,
    approvedBy: item.approved_by,
    approvedAt: item.approved_at,
  }
}

function mapDsoBottleneckStage(item: DsoBottleneckStageApiResponse): DsoBottleneckStage {
  return {
    key: item.key,
    stage: item.stage,
    averageDays: item.average_days,
    impactLevel: item.impact_level,
    description: item.description,
  }
}

function mapDsoRecommendation(item: DsoRecommendationApiResponse): DsoRecommendation {
  return {
    targetStage: item.target_stage,
    currentDays: item.current_days,
    reductionDays: item.reduction_days,
    projectedDso: item.projected_dso,
    fasterCashFlow: item.faster_cash_flow,
    narrative: item.narrative,
  }
}

function mapDsoProcessMetric(item: DsoProcessMetricApiResponse): DsoProcessMetric {
  return {
    transition: item.transition,
    averageDays: item.average_days,
    observedCount: item.observed_count,
    benchmarkDays: item.benchmark_days,
    source: item.source,
    status: item.status,
  }
}

function mapDsoAnalytics(item: DsoAnalyticsApiResponse): DsoAnalytics {
  return {
    asOf: item.as_of,
    currentDso: item.current_dso,
    lastMonthDso: item.last_month_dso,
    trendDays: item.trend_days,
    trendDirection: item.trend_direction,
    totalAccountsReceivable: item.total_accounts_receivable,
    averageDailySales: item.average_daily_sales,
    trailingSales: item.trailing_sales,
    bottleneckStages: item.bottleneck_stages.map(mapDsoBottleneckStage),
    recommendation: mapDsoRecommendation(item.recommendation),
    processEfficiency: item.process_efficiency.map(mapDsoProcessMetric),
    dataNotes: item.data_notes,
  }
}

function mapBehavioralScorecard(item: BehavioralScorecardApiResponse): BehavioralScorecard {
  return {
    accountName: item.account_name,
    payerCategory: item.payer_category,
    averageDaysToPay: item.average_days_to_pay,
    ignoredReminders: item.ignored_reminders,
    observedReminders: item.observed_reminders,
    totalOutstandingBalance: item.total_outstanding_balance,
    preferredChannel: normalizeChannel(item.preferred_channel),
    bestSendDay: item.best_send_day,
    bestSendTimeWindow: item.best_send_time_window,
    fallbackLayer: item.fallback_layer,
    vendorHistoryCount: item.vendor_history_count,
    manualReviewRequired: item.manual_review_required,
    isNewAccount: item.is_new_account,
    note: item.note,
  }
}

function mapInterventionPlaybookStep(item: InterventionPlaybookStepApiResponse): InterventionPlaybookStep {
  return {
    action: item.action,
    channel: item.channel,
    timing: item.timing,
    estimatedSuccessProbability: item.estimated_success_probability,
    requiresApproval: item.requires_approval,
    automationLevel: item.automation_level,
    rationale: item.rationale,
  }
}

function mapInterventionPlaybook(item: InterventionPlaybookApiResponse): InterventionPlaybook {
  return {
    invoiceId: item.invoice_id,
    accountName: item.account_name,
    modelName: item.model_name,
    sourceMode: item.source_mode,
    generatedAt: item.generated_at,
    similarCaseBasis: item.similar_case_basis,
    steps: item.steps.map(mapInterventionPlaybookStep),
    approvalSummary: {
      automatedSteps: item.approval_summary.automated_steps,
      manualSteps: item.approval_summary.manual_steps,
    },
  }
}

function mapIngestionIssue(item: IngestionIssueApiResponse): IngestionIssue {
  return {
    rowNumber: item.row_number,
    invoiceId: item.invoice_id,
    issues: item.issues,
  }
}

function mapIngestionPreview(item: IngestionPreviewApiResponse): IngestionPreview {
  return {
    previewId: item.preview_id,
    filename: item.filename,
    sourceMode: item.source_mode,
    mapping: item.mapping,
    previewRows: item.preview_rows,
    summary: {
      totalRows: item.summary.total_rows,
      validRows: item.summary.valid_rows,
      invalidRows: item.summary.invalid_rows,
      duplicateRows: item.summary.duplicate_rows,
      existingDuplicates: item.summary.existing_duplicates,
    },
    issues: item.issues.map(mapIngestionIssue),
    requiredFields: item.required_fields,
  }
}

function mapIngestionConfirmResult(item: IngestionConfirmApiResponse): IngestionConfirmResult {
  return {
    previewId: item.preview_id,
    filename: item.filename,
    sourceMode: item.source_mode,
    importedRows: item.imported_rows,
    skippedRows: item.skipped_rows,
    validRows: item.valid_rows,
    invalidRows: item.invalid_rows,
  }
}

function mapInteraction(item: Record<string, unknown>, index: number): InteractionLog {
  const fallbackId = `interaction-${index}-${String(item.invoice_id ?? item.id ?? "entry")}`
  const timestamp = String(item.timestamp ?? item.created_date ?? item.created_at ?? item.date ?? item.logged_at ?? "Unknown")
  const description = String(item.content ?? item.message ?? item.description ?? item.summary ?? item.note ?? "Activity logged")
  const eventType = String(item.interaction_type ?? item.type ?? item.event_type ?? item.channel ?? item.status ?? "Flag Updated")

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
  const isFormData = options.body instanceof FormData
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
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

export async function fetchCfoForecast() {
  const data = await apiFetch<CfoForecastApiResponse>("/api/cfo/forecast")
  return mapCfoForecast(data)
}

export async function approveCfoIncentive(invoiceId: string, approvedBy = "CFO") {
  const data = await apiFetch<CfoApprovalApiResponse>(
    `/api/cfo/incentives/${encodeURIComponent(invoiceId)}/approve`,
    {
      method: "POST",
      body: JSON.stringify({ approved_by: approvedBy }),
    }
  )

  return mapCfoApprovalResult(data)
}

export async function fetchDsoAnalytics() {
  const data = await apiFetch<DsoAnalyticsApiResponse>("/api/dso/analytics")
  return mapDsoAnalytics(data)
}

export async function fetchBehavioralScorecards() {
  const data = await apiFetch<BehavioralScorecardApiResponse[]>("/api/behavioral-scorecards")
  return data.map(mapBehavioralScorecard)
}

export async function fetchRewards() {
  const data = await apiFetch<PayerRewardApiResponse[]>("/api/rewards")
  return data.map(mapPayerReward)
}

export async function recalculateRewards() {
  const data = await apiFetch<PayerRewardApiResponse[]>("/api/rewards/recalculate", {
    method: "POST",
  })
  return data.map(mapPayerReward)
}

export async function fetchRewardForAccount(accountName: string) {
  const data = await apiFetch<PayerRewardApiResponse>(`/api/rewards/${encodeURIComponent(accountName)}`)
  return mapPayerReward(data)
}

export async function fetchInterventionPlaybook(invoiceId: string) {
  const data = await apiFetch<InterventionPlaybookApiResponse>(`/api/playbooks/${encodeURIComponent(invoiceId)}`)
  return mapInterventionPlaybook(data)
}

export async function previewIngestion(file: File) {
  const body = new FormData()
  body.append("file", file)
  const data = await apiFetch<IngestionPreviewApiResponse>("/api/ingestion/preview", {
    method: "POST",
    body,
  })
  return mapIngestionPreview(data)
}

export async function confirmIngestion(previewId: string) {
  const data = await apiFetch<IngestionConfirmApiResponse>("/api/ingestion/confirm", {
    method: "POST",
    body: JSON.stringify({ preview_id: previewId }),
  })
  return mapIngestionConfirmResult(data)
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
