import { useMemo, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"

import { NotificationSheet } from "@/components/layout/NotificationSheet"
import { Sidebar } from "@/components/layout/Sidebar"
import { initialNotifications } from "@/data/notifications"

const pageMeta: Record<string, { title: string; action?: string }> = {
  "/queue": { title: "Queue", action: "AI Summary ↗" },
  "/reminders": { title: "Reminders" },
  "/tasks": { title: "Tasks" },
  "/cfo": { title: "CFO View" },
  "/mapper": { title: "Data Mapper" },
  "/insights": { title: "DSO Analytics" },
}

export function AppShell() {
  const location = useLocation()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications]
  )

  const meta = pageMeta[location.pathname] ?? { title: "Revenue AI" }

  return (
    <div className="min-h-screen bg-[#F5F7FF] p-4 text-[#111827]">
      <div className="flex min-h-[calc(100vh-2rem)] gap-4">
        <Sidebar onNotificationsClick={() => setSheetOpen(true)} />

        <main className="min-w-0 flex-1 rounded-[32px] bg-[#EEF2FF] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-semibold leading-tight text-[#111827]">{meta.title}</h1>
              <p className="mt-1 text-sm text-[#6B7280]">Unread updates: {unreadCount}</p>
            </div>
          </div>

          <div className="mt-6">
            <Outlet />
          </div>
        </main>
      </div>

      <NotificationSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        notifications={notifications}
        onMarkAllRead={() =>
          setNotifications((current) => current.map((item) => ({ ...item, unread: false })))
        }
      />
    </div>
  )
}
