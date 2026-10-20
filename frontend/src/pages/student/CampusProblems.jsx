import { useEffect, useMemo, useState } from 'react'
import { Flame, Search } from 'lucide-react'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'
import PriorityBadge from '../../components/PriorityBadge.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import UrgencyVoteButton from '../../components/UrgencyVoteButton.jsx'
import { getCampusReports } from '../../services/reportService.js'
import { formatDate } from '../../utils/formatDate.js'
import { Link } from 'react-router-dom'

const statuses = ['Pending', 'In Progress', 'Resolved']
const categories = ['Infrastructure', 'Electrical', 'Water', 'Cleanliness', 'Internet', 'Other']
const priorities = ['Low', 'Medium', 'High']

function CampusProblems() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ search: '', status: '', category: '', priority: '', sort: 'recent' })

  useEffect(() => {
    let active = true
    getCampusReports().then((items) => { if (active) setReports(items) })
      .catch(() => { if (active) setError('Could not load campus problems. Please try again.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const visibleReports = useMemo(() => {
    const query = filters.search.trim().toLocaleLowerCase()
    const filtered = reports.filter((report) => {
      const matchesSearch = !query
        || `${report.title} ${report.location} ${report.category}`.toLocaleLowerCase().includes(query)
      return matchesSearch
        && (!filters.status || report.status === filters.status)
        && (!filters.category || report.category === filters.category)
        && (!filters.priority || report.priority === filters.priority)
    })
    return filtered.toSorted((left, right) => {
      if (filters.sort === 'urgent') {
        return right.urgencyVoteCount - left.urgencyVoteCount
          || new Date(right.createdAt) - new Date(left.createdAt)
      }
      if (filters.sort === 'oldest') return new Date(left.createdAt) - new Date(right.createdAt)
      return new Date(right.createdAt) - new Date(left.createdAt)
    })
  }, [reports, filters])

  function updateReportVote(id, vote) {
    setReports((current) => current.map((report) => report._id === id
      ? { ...report, urgencyVoteCount: vote.urgencyVoteCount, hasVoted: vote.hasVoted }
      : report))
  }

  function updateFilter(event) {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  return (
    <div>
      <p className="text-xs font-medium text-[var(--accent-hover)]">Shared campus feed</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Campus Problems</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">See issues reported across campus, follow their progress, and mark problems that need urgent attention.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <label className="relative text-xs font-medium text-[var(--text-muted)] sm:col-span-2 xl:col-span-1">Search problems
          <Search size={15} className="absolute bottom-3 left-3 text-[var(--text-muted)]" />
          <input name="search" value={filters.search} onChange={updateFilter} placeholder="Title, location, category" className="field-input mt-2 pl-9" />
        </label>
        <Filter name="status" label="Status" value={filters.status} options={statuses} onChange={updateFilter} />
        <Filter name="category" label="Category" value={filters.category} options={categories} onChange={updateFilter} />
        <Filter name="priority" label="Priority" value={filters.priority} options={priorities} onChange={updateFilter} />
        <label className="text-xs font-medium text-[var(--text-muted)]">Sort by
          <select name="sort" value={filters.sort} onChange={updateFilter} className="field-input mt-2">
            <option value="recent">Recent</option><option value="urgent">Most urgent</option><option value="oldest">Oldest</option>
          </select>
        </label>
      </div>

      <div className="mt-6">
        {loading ? <Loading label="Loading campus problems…" /> : error ? (
          <div role="alert" className="rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/10 p-5 text-sm text-[var(--error)]">{error} <button onClick={() => { setLoading(true); setError(''); getCampusReports().then(setReports).catch(() => setError('Could not load campus problems. Please try again.')).finally(() => setLoading(false)) }} className="ml-2 underline">Try again</button></div>
        ) : visibleReports.length === 0 ? (
          <EmptyState title={reports.length ? 'No campus problems match these filters.' : 'No campus problems have been reported yet.'} description={reports.length ? 'Adjust your search or filters to see other reported issues.' : 'When students report an issue, it will be visible here.'} />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {visibleReports.map((report) => (
              <article key={report._id} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><p className="text-xs text-[var(--text-muted)]">{report.category}</p><Link to={`/student/reports/${report._id}`} className="mt-1 block text-base font-semibold hover:text-[var(--accent-hover)]">{report.title}</Link></div>
                  <StatusBadge status={report.status} />
                </div>
                <p className="mt-2 text-xs text-[var(--text-muted)]">{report.location} · Reported by {report.reportedBy?.name || 'Student'} · {formatDate(report.createdAt)}</p>
                {report.issueGroup?.reportCount > 1 && <p className="mt-2 text-xs text-[var(--accent-hover)]">Part of a confirmed issue group · {report.issueGroup.reportCount} reports · {report.issueGroup.urgencyVoteCount} combined urgency votes</p>}
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--text-muted)]">{report.description}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                  <div className="flex items-center gap-3"><PriorityBadge priority={report.priority} /><span className="inline-flex items-center gap-1 text-xs text-[var(--warning)]"><Flame size={14} />{report.urgencyVoteCount} urgent</span></div>
                  <div className="flex items-center gap-2"><Link to={`/student/reports/${report._id}`} className="rounded-lg px-3 py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text)]">View details</Link><UrgencyVoteButton report={report} compact onChange={updateReportVote} /></div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Filter({ name, label, value, options, onChange }) {
  return <label className="text-xs font-medium text-[var(--text-muted)]">{label}<select name={name} value={value} onChange={onChange} className="field-input mt-2"><option value="">All {label.toLowerCase()}</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
}

export default CampusProblems
