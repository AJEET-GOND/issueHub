import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getAdminReports } from '../../services/adminService.js'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'
import PriorityBadge from '../../components/PriorityBadge.jsx'
import ReportCard from '../../components/ReportCard.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { formatDate } from '../../utils/formatDate.js'

const statuses = ['Pending', 'In Progress', 'Resolved', 'Rejected']
const categories = ['Infrastructure', 'Electrical', 'Water', 'Cleanliness', 'Internet', 'Other']
const priorities = ['Low', 'Medium', 'High']

function AdminReports() {
  const location = useLocation()
  const [filters, setFilters] = useState({ status: '', category: '', priority: '' })
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
      setReports(await getAdminReports(params))
    } catch {
      setError('Could not load reports. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [filters])
  useEffect(() => {
    let active = true
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
    getAdminReports(params).then((data) => { if (active) setReports(data) })
      .catch(() => { if (active) setError('Could not load reports. Please try again.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [filters])

  function selectFilter(event) {
    setLoading(true)
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">Review and track campus issues submitted by students.</p>
      {location.state?.success && <p role="status" className="mt-4 rounded-lg border border-[var(--success)]/20 bg-[var(--success)]/10 p-3 text-sm text-[var(--success)]">{location.state.success}</p>}
      {location.state?.warning && <p role="alert" className="mt-4 rounded-lg border border-[var(--warning)]/20 bg-[var(--warning)]/10 p-3 text-sm text-[var(--warning)]">{location.state.warning}</p>}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Filter name="status" label="Status" value={filters.status} options={statuses} onChange={selectFilter} />
        <Filter name="category" label="Category" value={filters.category} options={categories} onChange={selectFilter} />
        <Filter name="priority" label="Priority" value={filters.priority} options={priorities} onChange={selectFilter} />
      </div>
      <div className="mt-6">
        {loading ? <Loading label="Loading reports…" /> : error ? (
          <div role="alert" className="rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/10 p-5 text-sm text-[var(--error)]">{error} <button onClick={load} className="ml-2 underline">Try again</button></div>
        ) : reports.length === 0 ? (
          <EmptyState title={Object.values(filters).some(Boolean) ? 'No reports match these filters.' : 'No campus issues have been reported.'} description="When a student reports an issue, it will appear here." />
        ) : (
          <>
            <div className="space-y-3 lg:hidden">{reports.map((report) => <ReportCard key={report._id} report={report} to={`/admin/reports/${report._id}`} showReporter />)}</div>
            <div className="hidden overflow-hidden rounded-2xl border border-[var(--border)] lg:block">
              <table className="w-full table-fixed text-left text-xs">
                <thead className="bg-[var(--bg-secondary)] text-[var(--text-muted)]"><tr>
                  <th className="w-[17%] px-4 py-3 font-medium">Title</th><th className="w-[12%] px-3 py-3 font-medium">Student</th><th className="w-[11%] px-3 py-3 font-medium">Category</th><th className="w-[12%] px-3 py-3 font-medium">Location</th><th className="w-[10%] px-3 py-3 font-medium">Priority</th><th className="w-[10%] px-3 py-3 font-medium">Urgency</th><th className="w-[12%] px-3 py-3 font-medium">Status</th><th className="w-[10%] px-3 py-3 font-medium">Date</th><th className="w-[6%] px-3 py-3 font-medium">View</th>
                </tr></thead>
                <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
                  {reports.map((report) => <tr key={report._id} className="hover:bg-[var(--bg-secondary)]/60">
                    <td className="truncate px-4 py-3 font-medium" title={report.title}>{report.title}</td><td className="truncate px-3 py-3 text-[var(--text-muted)]" title={report.reportedBy?.name}>{report.reportedBy?.name || 'Student'}</td><td className="truncate px-3 py-3 text-[var(--text-muted)]">{report.category}</td><td className="truncate px-3 py-3 text-[var(--text-muted)]" title={report.location}>{report.location}</td><td className="px-3 py-3"><PriorityBadge priority={report.priority} /></td><td className="px-3 py-3 text-[var(--warning)]">🔥 {report.urgencyVoteCount}</td><td className="px-3 py-3"><StatusBadge status={report.status} /></td><td className="truncate px-3 py-3 text-[var(--text-muted)]">{formatDate(report.createdAt)}</td><td className="px-3 py-3"><Link to={`/admin/reports/${report._id}`} className="font-medium text-[var(--accent-hover)] hover:underline">View</Link></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Filter({ name, label, value, options, onChange }) {
  return <label className="text-xs font-medium text-[var(--text-muted)]">{label}<select name={name} value={value} onChange={onChange} className="field-input mt-2"><option value="">All {label.toLowerCase()}</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
}

export default AdminReports
