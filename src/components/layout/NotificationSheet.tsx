import { CheckCircle2 } from "lucide-react"

import type { NotificationItem } from "@/data/notifications"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const toneStyles = {
  red: "bg-[#FEE2E2] text-[#991B1B]",
  violet: "bg-[#F3E8FF] text-[#7C3AED]",
  green: "bg-[#D1FAE5] text-[#065F46]",
} as const

export function NotificationSheet({
  open,
  onOpenChange,
  notifications,
  onMarkAllRead,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  notifications: NotificationItem[]
  onMarkAllRead: () => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[380px] border-l border-[#E5E7EB] bg-white p-0 text-[#111827] sm:max-w-[380px]"
      >
        <SheetHeader className="border-b border-[#E5E7EB] px-6 py-5">
          <div className="flex items-center justify-between gap-4 pr-8">
            <SheetTitle className="text-base font-semibold text-[#111827]">Notifications</SheetTitle>
            <Button
              variant="link"
              className="h-auto p-0 text-xs font-medium text-[#7C3AED]"
              onClick={onMarkAllRead}
            >
              Mark all read
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-3 overflow-y-auto px-4 py-4">
          {notifications.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.id}
                className="relative flex items-start gap-3 rounded-2xl border border-[#F3F4F6] bg-white p-4 card-shadow"
              >
                <div className={cn("relative rounded-2xl p-2", toneStyles[item.tone])}>
                  <Icon className="h-[18px] w-[18px]" />
                  {item.unread ? (
                    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#7C3AED]" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-5 text-[#111827]">{item.text}</p>
                  <p className="mt-2 text-xs text-[#9CA3AF]">{item.timestamp}</p>
                </div>
              </div>
            )
          })}

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] p-8 text-center">
              <CheckCircle2 className="h-6 w-6 text-[#7C3AED]" />
              <p className="mt-3 text-sm font-medium text-[#111827]">You are all caught up.</p>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
