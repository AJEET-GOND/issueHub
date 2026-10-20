import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Plus, UsersRound } from 'lucide-react'
import DashboardStat from '../../components/DashboardStat.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'
import ReportCard from '../../components/ReportCard.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { getMyReports } from '../../services/reportService.js'

function StudentDashboard() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReports = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setReports(await getMyReports())
    } catch {
      setError('We couldn’t load your reports. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    getMyReports().then((data) => { if (active) setReports(data) })
      .catch(() => { if (active) setError('We couldn’t load your reports. Please check your connection.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  const pending = reports.filter((report) => report.status === 'Pending').length
  const resolved = reports.filter((report) => report.status === 'Resolved').length

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-medium text-[var(--accent-hover)]">Student dashboard</p><h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Welcome, {user.name}</h1><p className="mt-2 text-sm text-[var(--text-muted)]">Here’s what’s happening with your campus reports.</p></div>
        <div className="flex flex-wrap gap-2"><Link to="/student/problems" className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-medium hover:border-[var(--accent)]"><UsersRound size={16} />Campus problems</Link><Link to="/student/report" className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"><Plus size={16} />Report an issue</Link></div>
      </div>
      {loading ? <Loading label="Loading your dashboard…" /> : error ? <p role="alert" className="mt-6 text-sm text-[var(--error)]">{error} <button onClick={loadReports} className="underline">Try again</button></p> : <>
        <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4"><DashboardStat label="Your reports" value={reports.length} /><DashboardStat label="Pending" value={pending} /><DashboardStat label="Resolved" value={resolved} /><DashboardStat label="In progress" value={reports.filter((report) => report.status === 'In Progress').length} /></div>
        <section className="mt-9"><div className="mb-4 flex items-center justify-between"><h2 className="text-base font-semibold">Recent reports</h2><Link to="/student/reports" className="inline-flex items-center gap-1 text-xs text-[var(--accent-hover)]">View all <ArrowRight size={14} /></Link></div>{reports.length === 0 ? <EmptyState title="You haven’t reported any issues yet." description="Let the campus team know what needs attention." action={<Link to="/student/report" className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm text-white">Report an issue <ArrowRight size={14} /></Link>} /> : <div className="space-y-3">{reports.slice(0, 5).map((report) => <ReportCard key={report._id} report={report} to={`/student/reports/${report._id}`} />)}</div>}</section>
      </>}
    </div>
  )
}

export default StudentDashboard
