import type { TriageItem } from "@/lib/types"

export const triageReplies: TriageItem[] = [
  {
    id: "triage-1",
    customerId: "cust-priya",
    customerName: "Priya Sharma",
    receivedAt: "11:20 AM",
    rawReply: "I will complete the transfer by tonight and share the confirmation once done.",
    classification: "Commitment",
    actionTaken: "Commitment logged and reminders paused for 48h.",
    followUp: "Awaiting payment confirmation",
  },
  {
    id: "triage-2",
    customerId: "cust-sunita",
    customerName: "Sunita Medicare",
    receivedAt: "10:05 AM",
    rawReply: "Please hold collection action until we reconcile the insurer short-payment line items.",
    classification: "Disputed",
    actionTaken: "Task created for Billing / Dispute Handler.",
    followUp: "Awaiting dispute review",
  },
  {
    id: "triage-3",
    customerId: "cust-meera",
    customerName: "Meera Diagnostics",
    receivedAt: "Yesterday",
    rawReply: "No reply received after three reminders.",
    classification: "No response",
    actionTaken: "Risk level updated to High Risk.",
    followUp: "Escalation suggested",
  },
]
