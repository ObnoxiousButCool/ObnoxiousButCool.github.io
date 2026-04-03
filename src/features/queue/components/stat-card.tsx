import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { QueueStat } from "@/lib/types"

export function StatCard({ stat }: { stat: QueueStat }) {
  return (
    <Card className="rounded-[24px] border border-[#E0DED6] bg-white shadow-none">
      <CardHeader className="gap-2 pb-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#5F5E5A]">{stat.label}</p>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="text-[24px] font-medium tracking-[-0.03em] text-[#1A1A2E]">{stat.value}</div>
        <p className="mt-1 text-[13px] text-[#5F5E5A]">{stat.detail}</p>
      </CardContent>
    </Card>
  )
}
