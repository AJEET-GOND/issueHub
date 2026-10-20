import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FileText } from 'lucide-react'
import DashboardStat from '../../components/DashboardStat.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'
import ReportCard from '../../components/ReportCard.jsx'
import { getAdminDashboard } from '../../services/adminService.js'

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setDashboard(await getAdminDashboard()) } catch { setError('Could not load the admin dashboard. Check that the API is available.') } finally { setLoading(false) }
  }, [])
  useEffect(() => {
    let active = true
    getAdminDashboard().then((data) => { if (active) setDashboard(data) })
      .catch(() => { if (active) setError('Could not load the admin dashboard. Check that the API is available.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const stats = dashboard?.stats
  const recentReports = dashboard?.recentReports || []
  const mostUrgentProblems = dashboard?.mostUrgentProblems || []
  const highConcernCount = dashboard?.highConcernCount || 0
  return <div><p className="text-xs font-medium text-[var(--accent-hover)]">IssueHub Authority Portal</p><h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Admin Dashboard</h1><p className="mt-2 text-sm text-[var(--text-muted)]">Monitor and manage campus issues reported by students.</p>{loading ? <Loading label="Loading dashboard…" /> : error ? <p role="alert" className="mt-6 text-sm text-[var(--error)]">{error} <button onClick={load} className="underline">Try again</button></p> : <><div className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4"><DashboardStat label="Total reports" value={stats.total} /><DashboardStat label="Pending" value={stats.pending} /><DashboardStat label="In progress" value={stats.inProgress} /><DashboardStat label="Resolved" value={stats.resolved} /></div><section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="text-base font-semibold">Community urgency</h2><p className="mt-1 text-xs text-[var(--text-muted)]">Most supported problems from actual student votes.</p></div><Link to="/admin/insights" className="text-xs text-[var(--accent-hover)] hover:underline">All insights</Link></div>{mostUrgentProblems.length ? <div className="mt-4 grid gap-3 xl:grid-cols-3">{mostUrgentProblems.map((problem) => <article key={`${problem.category}-${problem.location}-${problem.title}`} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4"><p className="truncate text-sm font-medium">{problem.title}</p><p className="mt-1 truncate text-xs text-[var(--text-muted)]">{problem.category} · {problem.location}</p><p className="mt-3 text-xs text-[var(--warning)]">🔥 {problem.urgencyVoteCount} urgent votes · {problem.reportCount} {problem.reportCount === 1 ? 'report' : 'reports'}</p></article>)}</div> : <p className="mt-4 text-sm text-[var(--text-muted)]">No community urgency votes yet.</p>}{highConcernCount > 0 && <p className="mt-4 rounded-lg border border-[var(--warning)]/20 bg-[var(--warning)]/5 p-3 text-xs text-[var(--warning)]">{highConcernCount} problem{highConcernCount === 1 ? '' : 's'} meet the high community concern rules. <Link to="/admin/insights" className="underline">Review insights</Link></p>}</section><section className="mt-9"><div className="mb-4 flex items-center justify-between"><h2 className="text-base font-semibold">Recent reports</h2><Link to="/admin/reports" className="inline-flex items-center gap-1 text-xs text-[var(--accent-hover)]">View all reports <ArrowRight size={14} /></Link></div>{recentReports.length ? <div className="space-y-3">{recentReports.map((report) => <ReportCard key={report._id} report={report} to={`/admin/reports/${report._id}`} showReporter />)}</div> : <EmptyState title="No reports yet." description="New reports from students will appear here." action={<Link to="/admin/reports" className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-muted)]"><FileText size={14} />Open reports</Link>} />}</section></>}</div>
}

export default AdminDashboard
