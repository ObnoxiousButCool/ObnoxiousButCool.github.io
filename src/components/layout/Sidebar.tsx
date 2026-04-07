import { Bell, ChevronRight, Lightbulb, ListTodo, Settings2, Sparkles, type LucideIcon } from "lucide-react"
import { NavLink } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarItem {
  label: string
  to?: string
  icon: LucideIcon
  expandable?: boolean
  trailing?: React.ReactNode
}

const primaryItems: SidebarItem[] = [
  { label: "Queue", to: "/queue", icon: Sparkles },
  { label: "Reminders", to: "/reminders", icon: Bell, expandable: true },
  { label: "Tasks", to: "/tasks", icon: ListTodo, expandable: true },
  { label: "Insights", to: "/insights", icon: Lightbulb },
]

const secondaryItems: SidebarItem[] = [
  { label: "Notifications", icon: Bell, trailing: <span className="rounded-full bg-[#F3E8FF] px-2 py-0.5 text-[11px] font-medium text-[#7C3AED]">3</span> },
  { label: "Settings", icon: Settings2 },
]

function SidebarNavItem({
  item,
  onNotificationsClick,
}: {
  item: SidebarItem
  onNotificationsClick: () => void
}) {
  const content = (active = false) => (
    <div
      className={cn(
        "flex w-full items-center gap-3 rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active ? "bg-[#7C3AED] text-white" : "text-[#6B7280] hover:text-[#111827]"
      )}
    >
      <item.icon className="h-[18px] w-[18px]" />
      <span className="flex-1 text-left">{item.label}</span>
      {item.trailing}
      {item.expandable ? <ChevronRight className="h-4 w-4" /> : null}
    </div>
  )

  if (item.to) {
    return (
      <NavLink to={item.to} className="block">
        {({ isActive }) => content(isActive)}
      </NavLink>
    )
  }

  return (
    <Button
      variant="ghost"
      className="h-auto w-full justify-start rounded-full p-0 hover:bg-transparent"
      onClick={onNotificationsClick}
    >
      {content(false)}
    </Button>
  )
}

export function Sidebar({ onNotificationsClick }: { onNotificationsClick: () => void }) {
  return (
    <aside className="flex w-[240px] shrink-0 flex-col rounded-[28px] bg-white px-5 py-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C4B5FD]">Revenue AI</p>
        <h1 className="mt-2 text-xl font-bold text-[#7C3AED]">Collection OS</h1>
      </div>

      <nav className="mt-8 space-y-2">
        {primaryItems.map((item) => (
          <SidebarNavItem key={item.label} item={item} onNotificationsClick={onNotificationsClick} />
        ))}
      </nav>

      <div className="my-6 h-px bg-[#E5E7EB]" />

      <nav className="space-y-2">
        {secondaryItems.map((item) => (
          <SidebarNavItem key={item.label} item={item} onNotificationsClick={onNotificationsClick} />
        ))}
      </nav>

      <div className="mt-auto rounded-2xl bg-[#F8FAFC] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7C3AED] text-sm font-semibold text-white">
            SK
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111827]">Shloka Kulkarni</p>
            <p className="text-xs text-[#6B7280]">Finance Ops Executive</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-[#9CA3AF]">Credits: 847 remaining</p>
      </div>
    </aside>
  )
}
