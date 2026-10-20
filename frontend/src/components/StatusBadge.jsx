const statusClasses = {
  Pending: 'bg-[color-mix(in_srgb,var(--warning)_14%,transparent)] text-[var(--warning)]',
  'In Progress': 'bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-[#a98cf7]',
  Resolved: 'bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)]',
  Rejected: 'bg-[color-mix(in_srgb,var(--error)_15%,transparent)] text-[var(--error)]',
}

function StatusBadge({ status }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${statusClasses[status] || 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}>{status || 'Unknown'}</span>
}

export default StatusBadge
