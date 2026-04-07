import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom"

import { AppShell } from "@/components/layout/AppShell"
import { Toaster } from "@/components/ui/sonner"
import { InsightsPage } from "@/features/insights/insights-page"
import { QueuePage } from "@/features/queue/queue-page"
import { RemindersPage } from "@/features/reminders/reminders-page"
import { TasksPage } from "@/features/tasks/tasks-page"
import { DashboardStoreProvider } from "@/lib/dashboard-store"

function App() {
  return (
    <DashboardStoreProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/queue" replace />} />
          <Route path="/" element={<AppShell />}>
            <Route path="queue" element={<QueuePage />} />
            <Route path="reminders" element={<RemindersPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="insights" element={<InsightsPage />} />
          </Route>
        </Routes>
        <Toaster richColors position="top-right" />
      </Router>
    </DashboardStoreProvider>
  )
}

export default App
