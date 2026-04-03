import { Badge } from "@/components/ui/badge"
import type { AgingBucketType } from "@/lib/types"

const bucketStyles: Record<AgingBucketType, string> = {
  "30-day bucket": "bg-[#E6F1FB] text-[#0C447C]",
  "45-day bucket": "bg-[#FAEEDA] text-[#633806]",
  "60+ days": "bg-[#FCEBEB] text-[#791F1F]",
}

export function AgingBucket({ bucket, days }: { bucket: AgingBucketType; days: number }) {
  return (
    <Badge className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${bucketStyles[bucket]}`}>
      {days} days
    </Badge>
  )
}
