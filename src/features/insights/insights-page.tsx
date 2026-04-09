import { BarChart2 } from "lucide-react"

export function InsightsPage() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center">
      <div className="rounded-2xl bg-white px-10 py-12 text-center card-shadow">
        <BarChart2 className="mx-auto h-14 w-14 text-[#C4B5FD]" />
        <h2 className="mt-6 text-[20px] font-semibold text-[#374151]">Insights coming in v2</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#9CA3AF]">
          Collection trends, response rates by channel, and aging analysis will appear here after your first 30 days
          of data.
        </p>
      </div>
    </section>
  )
}
