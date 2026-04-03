import { EmptyStateCard } from "@/components/empty-state-card"

export function InsightsPage() {
  return (
    <EmptyStateCard
      title="Insights coming in v2"
      description="Collection KPIs, aging trend, and response rate are intentionally deferred to v2. This MVP keeps the tab visible so the information architecture matches the launch plan without introducing charts or out-of-scope analytics."
    />
  )
}
