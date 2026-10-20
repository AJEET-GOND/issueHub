import { Link } from 'react-router-dom'
import { ArrowUpRight, MapPin } from 'lucide-react'
import StatusBadge from './StatusBadge.jsx'
import PriorityBadge from './PriorityBadge.jsx'
import { formatDate } from '../utils/formatDate.js'

function ReportCard({ report, to, showReporter = false }) {
  return (
    <Link to={to} className="group block rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--accent)]/50 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-[var(--text)] group-hover:text-[var(--accent-hover)]">{report.title}</h3><p className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><MapPin size={13} />{report.location}</p></div>
        <ArrowUpRight size={16} className="shrink-0 text-[var(--text-muted)] transition group-hover:text-[var(--accent)]" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--border)] pt-3 text-xs text-[var(--text-muted)]">
        <span>{report.category}</span>{showReporter && <span>By {report.reportedBy?.name || 'Student'}</span>}<PriorityBadge priority={report.priority} /><span aria-label="Community urgency votes">🔥 {report.urgencyVoteCount ?? 0}</span><span>{formatDate(report.createdAt)}</span><StatusBadge status={report.status} />
      </div>
    </Link>
  )
}

export default ReportCard
