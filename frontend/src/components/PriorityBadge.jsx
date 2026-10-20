function PriorityBadge({ priority }) {
  const classes = {
    High: 'text-[var(--error)]',
    Medium: 'text-[var(--warning)]',
    Low: 'text-[var(--text-muted)]',
  }
  return <span className={`text-xs font-medium ${classes[priority] || 'text-[var(--text-muted)]'}`}>{priority || '—'}</span>
}

export default PriorityBadge
