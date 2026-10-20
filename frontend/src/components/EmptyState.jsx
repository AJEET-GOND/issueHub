import { ClipboardList } from 'lucide-react'

function EmptyState({ title = 'No reports found.', description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-12 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-xl bg-[var(--bg-secondary)] text-[var(--text-muted)]"><ClipboardList size={21} /></span>
      <h2 className="mt-4 text-base font-semibold">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--text-muted)]">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export default EmptyState
