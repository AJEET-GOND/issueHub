import EmptyState from './EmptyState.jsx'
import Loading from './Loading.jsx'
import ReportCard from './ReportCard.jsx'

function ReportList({ reports, loading, error, toPrefix, emptyTitle = 'No reports found.', onRetry, showReporter = false }) {
  if (loading) return <Loading label="Loading reports…" />
  if (error) return <div className="rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/10 p-5 text-sm text-[var(--error)]" role="alert">{error} {onRetry && <button onClick={onRetry} className="ml-2 underline">Try again</button>}</div>
  if (!reports.length) return <EmptyState title={emptyTitle} description="When an issue is reported, it will appear here." />
  return <div className="space-y-3">{reports.map((report) => <ReportCard key={report._id} report={report} to={`${toPrefix}/${report._id}`} showReporter={showReporter} />)}</div>
}

export default ReportList
