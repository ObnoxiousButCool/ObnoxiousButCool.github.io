import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function EmptyStateCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Card className="rounded-[24px] border border-[#E0DED6] bg-white shadow-none">
      <CardHeader className="border-b border-[#E0DED6]">
        <CardTitle className="text-[16px] font-medium text-[#1A1A2E]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="py-10">
        <p className="max-w-[520px] text-[14px] leading-6 text-[#5F5E5A]">{description}</p>
      </CardContent>
    </Card>
  )
}
