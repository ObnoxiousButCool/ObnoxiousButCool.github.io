import { useMemo, useState } from "react"
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd"

import { TaskCard } from "@/components/tasks/TaskCard"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useDashboardStore } from "@/lib/dashboard-store"
import type { CloseOutcome, TaskItem, TaskStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const columns: { key: TaskStatus; className: string }[] = [
  { key: "Open", className: "bg-[#EFF6FF] text-[#1D4ED8]" },
  { key: "In Progress", className: "bg-[#FFFBEB] text-[#B45309]" },
  { key: "Closed", className: "bg-[#F3F4F6] text-[#6B7280]" },
]

const outcomeStyles: Record<CloseOutcome, string> = {
  Yes: "bg-[#D1FAE5] text-[#065F46] hover:bg-[#BBF7D0]",
  No: "bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FECACA]",
  Partial: "bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A]",
}

export function KanbanBoard() {
  const { tasks, updateTaskStatus, closeTask } = useDashboardStore()
  const [closeCandidate, setCloseCandidate] = useState<TaskItem | null>(null)

  const groupedTasks = useMemo(
    () => ({
      Open: tasks.filter((task) => task.status === "Open"),
      "In Progress": tasks.filter((task) => task.status === "In Progress"),
      Closed: tasks.filter((task) => task.status === "Closed"),
    }),
    [tasks]
  )

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return
    }

    const destination = result.destination.droppableId as TaskStatus
    const source = result.source.droppableId as TaskStatus

    if (destination === source) {
      return
    }

    const task = groupedTasks[source][result.source.index]
    if (!task) {
      return
    }

    if (destination === "Closed") {
      setCloseCandidate(task)
      return
    }

    updateTaskStatus(task.id, destination)
  }

  const handleOutcome = (outcome: CloseOutcome) => {
    if (!closeCandidate) {
      return
    }

    closeTask(closeCandidate.id, outcome)
    setCloseCandidate(null)
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid gap-6 xl:grid-cols-3">
          {columns.map((column) => (
            <div key={column.key} className="rounded-2xl bg-white p-4 card-shadow">
              <div className={cn("rounded-xl px-4 py-3", column.className)}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">{column.key}</h3>
                  <span className="text-xs font-medium">{groupedTasks[column.key].length}</span>
                </div>
              </div>

              <Droppable droppableId={column.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "mt-4 min-h-[520px] space-y-3 rounded-2xl p-2 transition-colors",
                      snapshot.isDraggingOver && "border border-dashed border-[#7C3AED] bg-[#F5F3FF]"
                    )}
                  >
                    {groupedTasks[column.key].map((task, index) => (
                      <TaskCard key={task.id} task={task} index={index} onMarkClosed={setCloseCandidate} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <Dialog open={closeCandidate !== null} onOpenChange={(open) => !open && setCloseCandidate(null)}>
        <DialogContent className="max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#111827]">Was payment received?</DialogTitle>
            <DialogDescription className="text-sm text-[#6B7280]">
              Confirm the collection outcome before moving this task to Closed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-2 border-t border-[#F3F4F6] bg-white px-0 pb-0 pt-4">
            {(["Yes", "No", "Partial"] as CloseOutcome[]).map((outcome) => (
              <Button
                key={outcome}
                className={cn("rounded-full px-4 text-sm font-medium", outcomeStyles[outcome])}
                onClick={() => handleOutcome(outcome)}
              >
                {outcome}
              </Button>
            ))}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
