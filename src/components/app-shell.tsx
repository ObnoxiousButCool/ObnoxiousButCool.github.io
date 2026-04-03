import { NavLink, Outlet } from "react-router-dom"

import { cn } from "@/lib/utils"

const navItems = [
  { to: "/queue", label: "Queue" },
  { to: "/reminders", label: "Reminders" },
  { to: "/tasks", label: "Tasks" },
  { to: "/insights", label: "Insights" },
]

export function AppShell() {
  return (
    <div className="min-h-screen bg-[#f8f5ef] px-8 py-8 text-[#1A1A2E]">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-6 flex items-start justify-between rounded-[28px] border border-[#E0DED6] bg-white px-7 py-6 shadow-[0_20px_40px_rgba(26,26,46,0.05)]">
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#185FA5]">
              Agentic AI for Smart Revenue Collection
            </p>
            <div>
              <h1 className="text-[16px] font-medium text-[#1A1A2E]">
                Defaulter recovery operations
              </h1>
              <p className="mt-1 text-[13px] text-[#5F5E5A]">
                Queue review, reminders, triage, and follow-up task closure in a single finance workflow.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E0DED6] bg-[#F1EFE8] px-4 py-3 text-right">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#5F5E5A]">
              Morning brief
            </p>
            <p className="mt-1 max-w-[280px] text-[13px] leading-5 text-[#1A1A2E]">
              8 accounts sit in the 60+ bucket. 3 newly flagged High Risk. AI sorted the queue to surface the fastest
              recovery opportunities first.
            </p>
          </div>
        </header>

        <nav className="mb-6 flex gap-2 rounded-[24px] border border-[#E0DED6] bg-white p-2 shadow-[0_12px_24px_rgba(26,26,46,0.04)]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "rounded-[18px] px-4 py-2 text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-[#185FA5] text-white"
                    : "text-[#5F5E5A] hover:bg-[#F1EFE8] hover:text-[#1A1A2E]"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Outlet />
      </div>
    </div>
  )
}
