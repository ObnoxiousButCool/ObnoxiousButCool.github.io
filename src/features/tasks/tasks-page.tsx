import { KanbanBoard } from "@/components/tasks/KanbanBoard"

export function TasksPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-[22px] font-semibold text-[#111827]">Tasks</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Follow disputes, escalations, and payment confirmations through to closure.
        </p>
      </div>

      <KanbanBoard />
    </section>
  )
}
