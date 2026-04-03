import { Badge } from "@/components/ui/badge"
import type { RiskLevel } from "@/lib/types"

const riskStyles: Record<RiskLevel, string> = {
  "High Risk": "bg-[#FCEBEB] text-[#791F1F]",
  Watch: "bg-[#FAEEDA] text-[#633806]",
  Normal: "bg-[#F1EFE8] text-[#444441]",
}

export function DefaulterFlagBadge({ level }: { level: RiskLevel }) {
  return (
    <Badge className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${riskStyles[level]}`}>
      {level}
    </Badge>
  )
}
