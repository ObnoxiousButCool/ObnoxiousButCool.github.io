import { TaskBoard } from "@/features/tasks/components/task-board"

export function TasksPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[24px] border border-[#E0DED6] bg-white p-5 shadow-[0_12px_24px_rgba(26,26,46,0.04)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#185FA5]">Task Management</p>
        <h2 className="mt-1 text-[16px] font-medium text-[#1A1A2E]">
          Track every open dispute or follow-up case to closure with a full audit trail
        </h2>
        <p className="mt-2 max-w-[760px] text-[13px] leading-6 text-[#5F5E5A]">
          Open, In Progress, and Closed columns keep the finance team aligned while closure outcomes feed the future
          Insights layer.
        </p>
      </div>

      <TaskBoard />
    </section>
  )
}
