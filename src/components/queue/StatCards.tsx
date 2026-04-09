import { AlertTriangle, Clock3, Send, Users, type LucideIcon } from "lucide-react"

import type { QueueStat } from "@/lib/types"

const statIcons: Record<string, LucideIcon> = {
  "Total outstanding": Users,
  "Active defaulters": AlertTriangle,
  "Reminders sent today": Send,
  "Avg days overdue": Clock3,
}

export function StatCards({ stats }: { stats: QueueStat[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = statIcons[stat.label]

        return (
          <div key={stat.label} className="rounded-2xl bg-white p-5 card-shadow">
            <Icon className="h-[22px] w-[22px] text-[#8B5CF6]" />
            <p className="mt-5 text-[13px] font-normal text-[#6B7280]">{stat.label}</p>
            <p className="mt-2 text-[28px] font-bold leading-none text-[#111827]">{stat.value}</p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="text-xs text-[#6B7280]">{stat.detail}</span>
              <span className="rounded-full bg-[#F3E8FF] px-2.5 py-1 text-[11px] font-medium text-[#7C3AED]">
                {stat.delta}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
