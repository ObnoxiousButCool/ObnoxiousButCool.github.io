export function CreditsIndicator({ used, remaining }: { used: number; remaining: number }) {
  return (
    <p className="text-xs text-[#6B7280]">
      Credits used this session: {used} · Remaining: {remaining}
    </p>
  )
}
