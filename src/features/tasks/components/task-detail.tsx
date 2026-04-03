import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { TaskItem, TaskStatus } from "@/lib/types"

export function TaskDetail({
  open,
  task,
  onClose,
  onMove,
}: {
  open: boolean
  task: TaskItem | null
  onClose: (open: boolean) => void
  onMove: (status: TaskStatus) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[560px] max-w-none border-l border-[#E0DED6] bg-white p-0">
        {task ? (
          <>
            <SheetHeader className="border-b border-[#E0DED6] px-6 py-5">
              <SheetTitle className="text-[16px] font-medium text-[#1A1A2E]">{task.taskType}</SheetTitle>
              <SheetDescription className="text-[13px] text-[#5F5E5A]">
                {task.customerName} · assigned to {task.assignedTo}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-5 px-6 py-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[18px] bg-[#F8F5EF] p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#5F5E5A]">Status</p>
                  <p className="mt-2 text-[14px] font-medium text-[#1A1A2E]">{task.status}</p>
                </div>
                <div className="rounded-[18px] bg-[#F8F5EF] p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#5F5E5A]">Created</p>
                  <p className="mt-2 text-[14px] font-medium text-[#1A1A2E]">{task.createdAt}</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#5F5E5A]">Notes</p>
                <div className="mt-2 rounded-[18px] bg-[#F8F5EF] p-4 text-[13px] leading-6 text-[#1A1A2E]">
                  {task.notes}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#5F5E5A]">Audit trail</p>
                <div className="mt-2 space-y-2">
                  {task.auditTrail.map((entry) => (
                    <div key={entry} className="rounded-[16px] border border-[#E0DED6] px-4 py-3 text-[13px] text-[#1A1A2E]">
                      {entry}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#5F5E5A]">Move task</p>
                <div className="mt-3 flex gap-2">
                  {(["Open", "In Progress", "Closed"] as TaskStatus[]).map((status) => (
                    <Button
                      key={status}
                      variant={task.status === status ? "default" : "outline"}
                      className={
                        task.status === status
                          ? "rounded-full bg-[#185FA5] text-white"
                          : "rounded-full border-[#E0DED6] text-[#1A1A2E]"
                      }
                      onClick={() => onMove(status)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
