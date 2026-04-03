import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TriageItem } from "@/lib/types"

const triageStyles = {
  "Payment commitment": "bg-[#EAF3DE] text-[#27500A]",
  "Disputed — task created": "bg-[#FAEEDA] text-[#633806]",
  "No response — flag updated": "bg-[#FCEBEB] text-[#791F1F]",
} as const

export function TriageCard({ item }: { item: TriageItem }) {
  return (
    <Card className="rounded-[22px] border border-[#E0DED6] bg-white shadow-none">
      <CardHeader className="gap-2 border-b border-[#E0DED6] pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-[14px] font-medium text-[#1A1A2E]">{item.customerName}</CardTitle>
            <p className="mt-1 text-[12px] text-[#5F5E5A]">{item.receivedAt}</p>
          </div>
          <Badge className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${triageStyles[item.classification]}`}>
            {item.classification}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#5F5E5A]">Raw reply</p>
          <p className="mt-2 text-[13px] leading-6 text-[#1A1A2E]">{item.rawReply}</p>
        </div>
        <div className="rounded-[18px] bg-[#F8F5EF] p-3">
          <p className="text-[12px] font-medium text-[#1A1A2E]">{item.actionTaken}</p>
          <p className="mt-1 text-[12px] text-[#5F5E5A]">{item.followUp}</p>
        </div>
      </CardContent>
    </Card>
  )
}
