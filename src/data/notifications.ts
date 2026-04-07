import { AlertTriangle, CheckCircle2, Flag, Sparkles, type LucideIcon } from "lucide-react"

export interface NotificationItem {
  id: string
  icon: LucideIcon
  tone: "red" | "violet" | "green"
  text: string
  timestamp: string
  unread: boolean
}

export const initialNotifications: NotificationItem[] = [
  {
    id: "notification-1",
    icon: AlertTriangle,
    tone: "red",
    text: "8 accounts in 60+ day bucket - action needed",
    timestamp: "2h ago",
    unread: true,
  },
  {
    id: "notification-2",
    icon: Flag,
    tone: "red",
    text: "3 accounts newly flagged High Risk",
    timestamp: "2h ago",
    unread: true,
  },
  {
    id: "notification-3",
    icon: Sparkles,
    tone: "violet",
    text: "AI has re-sorted the queue",
    timestamp: "3h ago",
    unread: true,
  },
  {
    id: "notification-4",
    icon: CheckCircle2,
    tone: "green",
    text: "Priya Sharma committed to payment - reminders paused",
    timestamp: "5h ago",
    unread: false,
  },
]
