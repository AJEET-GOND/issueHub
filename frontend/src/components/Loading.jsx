import { LoaderCircle } from 'lucide-react'

function Loading({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-[var(--text-muted)]" role="status">
      <LoaderCircle size={18} className="animate-spin text-[var(--accent)]" />
      {label}
    </div>
  )
}

export default Loading
