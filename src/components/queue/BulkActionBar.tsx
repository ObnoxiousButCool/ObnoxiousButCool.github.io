import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"

export function BulkActionBar({
  selectedCount,
  onSendBulk,
}: {
  selectedCount: number
  onSendBulk: () => void
}) {
  if (selectedCount === 0) {
    return null
  }

  return (
    <div className="animate-in slide-in-from-top-2 duration-300">
      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-[#7C3AED] px-4 py-3 text-white shadow-md">
        <p className="text-sm font-medium">{selectedCount} accounts selected</p>
        <Button
          className="h-8 rounded-full bg-white px-3 text-xs font-semibold text-[#7C3AED] hover:bg-white/90"
          onClick={onSendBulk}
        >
          Send bulk reminder <Send className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
