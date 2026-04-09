import type { TaskItem } from "@/lib/types"

export const taskItems: TaskItem[] = [
  {
    id: "task-1",
    customerId: "cust-sunita",
    customerName: "Sunita Medicare",
    taskType: "Resolve insurer deduction dispute",
    status: "Open",
    createdAt: "Today, 11:21 AM",
    assignedTo: "Anita Rao",
    notes: "Validate the insurer short-payment line items and share reconciliation back to collections.",
    auditTrail: [
      "AI triage marked as dispute",
      "Task auto-created from customer reply",
      "Manager review pending",
    ],
  },
  {
    id: "task-2",
    customerId: "cust-ramesh",
    customerName: "Ramesh Patil",
    taskType: "Manager escalation for repeated non-response",
    status: "In Progress",
    createdAt: "Yesterday, 4:10 PM",
    assignedTo: "Vikram Shah",
    notes: "High Risk account with no commitment despite four touches. Evaluate final escalation wording.",
    auditTrail: [
      "Flag upgraded to High Risk",
      "Escalation assigned to Finance Manager",
      "Callback planned for today afternoon",
    ],
  },
  {
    id: "task-3",
    customerId: "cust-priya",
    customerName: "Priya Sharma",
    taskType: "Confirm partial payment receipt",
    status: "Closed",
    createdAt: "Apr 1, 2:40 PM",
    assignedTo: "Neha Joshi",
    notes: "Customer requested revised receipt after partial settlement.",
    auditTrail: [
      "Partial payment marked in system",
      "Receipt re-issued",
      "Closed with outcome: Partial",
    ],
  },
]
