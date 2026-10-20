function DashboardStat({ label, value, detail }) {
  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {detail && <p className="mt-1 text-[11px] text-[var(--text-muted)]">{detail}</p>}
    </article>
  )
}

export default DashboardStat
