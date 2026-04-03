import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function CustomerRowActions({
  customerId,
  onTask,
}: {
  customerId: string
  onTask: () => void
}) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
      <Button
        className="h-8 rounded-full bg-[#185FA5] px-3 text-[12px] font-medium text-white hover:bg-[#144f88]"
        onClick={() => navigate(`/reminders?customer=${customerId}`)}
      >
        Send ↗
      </Button>
      <Button
        variant="outline"
        className="h-8 rounded-full border-[#E0DED6] px-3 text-[12px] font-medium text-[#1A1A2E]"
        onClick={onTask}
      >
        Task
      </Button>
    </div>
  )
}
