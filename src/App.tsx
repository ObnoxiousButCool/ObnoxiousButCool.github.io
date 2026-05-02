import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom"

import { AppShell } from "@/components/layout/AppShell"
import { Toaster } from "@/components/ui/sonner"
import { CfoPage } from "@/features/cfo/cfo-page"
import { DocumentValidationPage } from "@/features/documents/document-validation-page"
import { InsightsPage } from "@/features/insights/insights-page"
import { MapperPage } from "@/features/mapper/mapper-page"
import { QueuePage } from "@/features/queue/queue-page"
import { RemindersPage } from "@/features/reminders/reminders-page"
import { RewardsPage } from "@/features/rewards/rewards-page"
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
            <Route path="cfo" element={<CfoPage />} />
            <Route path="rewards" element={<RewardsPage />} />
            <Route path="mapper" element={<MapperPage />} />
            <Route path="documents" element={<DocumentValidationPage />} />
            <Route path="insights" element={<InsightsPage />} />
          </Route>
        </Routes>
        <Toaster richColors position="top-right" />
      </Router>
    </DashboardStoreProvider>
  )
}

export default App
