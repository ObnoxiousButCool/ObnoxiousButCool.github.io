import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TaskDetail } from "@/features/tasks/components/task-detail"
import { useDashboardStore } from "@/lib/dashboard-store"
import type { CloseOutcome, TaskItem, TaskStatus } from "@/lib/types"

const columns: TaskStatus[] = ["Open", "In Progress", "Closed"]

export function TaskBoard() {
  const { tasks, updateTaskStatus, closeTask } = useDashboardStore()
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null)
  const [closeCandidate, setCloseCandidate] = useState<TaskItem | null>(null)

  const groupedTasks = useMemo(
    () => ({
      Open: tasks.filter((task) => task.status === "Open"),
      "In Progress": tasks.filter((task) => task.status === "In Progress"),
      Closed: tasks.filter((task) => task.status === "Closed"),
    }),
    [tasks]
  )

  const handleMove = (task: TaskItem, status: TaskStatus) => {
    if (status === "Closed") {
      setCloseCandidate(task)
      return
    }

    updateTaskStatus(task.id, status)
    setSelectedTask({ ...task, status })
  }

  const handleClose = (outcome: CloseOutcome) => {
    if (!closeCandidate) {
      return
    }

    closeTask(closeCandidate.id, outcome)
    setSelectedTask({ ...closeCandidate, status: "Closed", auditTrail: [...closeCandidate.auditTrail, `Closed with outcome: ${outcome}`] })
    setCloseCandidate(null)
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {columns.map((column) => (
          <div key={column} className="rounded-[24px] border border-[#E0DED6] bg-white p-4 shadow-[0_12px_24px_rgba(26,26,46,0.04)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#5F5E5A]">{column}</p>
                <h3 className="mt-1 text-[16px] font-medium text-[#1A1A2E]">{groupedTasks[column].length} cases</h3>
              </div>
            </div>

            <div className="space-y-3">
              {groupedTasks[column].length > 0 ? (
                groupedTasks[column].map((task) => (
                  <button
                    key={task.id}
                    className="w-full rounded-[20px] border border-[#E0DED6] bg-[#F8F5EF] p-4 text-left transition-colors hover:border-[#185FA5]"
                    onClick={() => setSelectedTask(task)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-medium text-[#1A1A2E]">{task.customerName}</p>
                        <p className="mt-1 text-[12px] text-[#5F5E5A]">{task.taskType}</p>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[#1A1A2E]">
                        {task.assignedTo}
                      </span>
                    </div>
                    <p className="mt-3 text-[12px] leading-5 text-[#5F5E5A]">{task.notes}</p>
                    <div className="mt-4 flex items-center justify-between text-[12px] text-[#5F5E5A]">
                      <span>{task.createdAt}</span>
                      <span>View detail</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-[20px] border border-dashed border-[#E0DED6] bg-[#F8F5EF] px-4 py-10 text-center">
                  <p className="text-[14px] font-medium text-[#1A1A2E]">All caught up. No open tasks.</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <TaskDetail
        open={selectedTask !== null}
        task={selectedTask}
        onClose={(open) => {
          if (!open) {
            setSelectedTask(null)
          }
        }}
        onMove={(status) => {
          if (!selectedTask) {
            return
          }
          handleMove(selectedTask, status)
        }}
      />

      <Dialog open={closeCandidate !== null} onOpenChange={(open) => !open && setCloseCandidate(null)}>
        <DialogContent className="border border-[#E0DED6] bg-white">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-medium text-[#1A1A2E]">Was payment received?</DialogTitle>
            <DialogDescription className="text-[13px] text-[#5F5E5A]">
              Close the task and log the outcome so the finance team can learn from the case.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t border-[#E0DED6] bg-[#F8F5EF]">
            {(["Yes", "No", "Partial"] as CloseOutcome[]).map((outcome) => (
              <Button
                key={outcome}
                className="rounded-full bg-[#185FA5] text-white hover:bg-[#144f88]"
                onClick={() => handleClose(outcome)}
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
