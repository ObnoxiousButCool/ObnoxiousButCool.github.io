import { Draggable } from "@hello-pangea/dnd"

import { Button } from "@/components/ui/button"
import type { TaskItem, TaskStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const statusStyles: Record<TaskStatus, string> = {
  Open: "bg-[#DBEAFE] text-[#1E40AF]",
  "In Progress": "bg-[#FEF3C7] text-[#92400E]",
  Closed: "bg-[#E5E7EB] text-[#6B7280]",
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function TaskCard({
  task,
  index,
  onMarkClosed,
}: {
  task: TaskItem
  index: number
  onMarkClosed: (task: TaskItem) => void
}) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "rounded-xl bg-white p-4 card-shadow transition-transform",
            snapshot.isDragging && "scale-[1.02] shadow-md"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#111827]">{task.customerName}</p>
              <p className="mt-1 text-xs text-[#6B7280]">{task.taskType}</p>
            </div>
            <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", statusStyles[task.status])}>
              {task.status}
            </span>
          </div>

          <p className="mt-3 text-xs text-[#9CA3AF]">{task.createdAt}</p>
          <p className="mt-3 text-[13px] italic leading-5 text-[#6B7280]">{task.notes}</p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7C3AED] text-[11px] font-semibold text-white">
                {getInitials(task.assignedTo)}
              </div>
              <span className="text-xs text-[#6B7280]">{task.assignedTo}</span>
            </div>

            {task.status !== "Closed" ? (
              <Button
                variant="ghost"
                className="h-8 rounded-full px-3 text-xs font-medium text-[#6B7280] hover:bg-[#F5F3FF] hover:text-[#111827]"
                onClick={() => onMarkClosed(task)}
              >
                Mark closed
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </Draggable>
  )
}
