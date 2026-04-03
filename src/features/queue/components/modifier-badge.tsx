import { Badge } from "@/components/ui/badge"
import type { ModifierType } from "@/lib/types"

const modifierStyles: Record<ModifierType, string> = {
  penalty: "bg-[#FAEEDA] text-[#633806]",
  incentive: "bg-[#EAF3DE] text-[#27500A]",
}

export function ModifierBadge({
  type,
  label,
}: {
  type: ModifierType
  label: string
}) {
  return (
    <Badge className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${modifierStyles[type]}`}>
      {label}
    </Badge>
  )
}
