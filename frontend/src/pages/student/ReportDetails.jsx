import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react'
import { getMyReport } from '../../services/reportService.js'
import { formatDate } from '../../utils/formatDate.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import PriorityBadge from '../../components/PriorityBadge.jsx'
import Loading from '../../components/Loading.jsx'
import UrgencyVoteButton from '../../components/UrgencyVoteButton.jsx'

function ReportDetails() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getMyReport(id).then((data) => { if (active) setReport(data) }).catch((requestError) => {
      if (active) setError(requestError.response?.status === 404 ? 'Report not found.' : 'Could not load this report.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  if (loading) return <Loading label="Loading report…" />
  if (error) return <div><Link to="/student/problems" className="text-xs text-[var(--text-muted)]">← Campus problems</Link><p role="alert" className="mt-5 text-sm text-[var(--error)]">{error}</p></div>

  function updateVote(_id, vote) {
    setReport((current) => ({ ...current, urgencyVoteCount: vote.urgencyVoteCount, hasVoted: vote.hasVoted }))
  }

  return (
    <div className="max-w-4xl">
      <Link to="/student/problems" className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--text)]"><ArrowLeft size={14} />Campus problems</Link>
      <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs text-[var(--text-muted)]">{report.category}</p><h1 className="mt-2 text-2xl font-semibold">{report.title}</h1><p className="mt-2 text-xs text-[var(--text-muted)]">Reported by {report.reportedBy?.name || 'Student'}</p></div><StatusBadge status={report.status} /></div>
        <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-[var(--text-muted)]">{report.description}</p>
        {report.imageUrl && <figure className="mt-6"><img src={report.imageUrl} alt={`Photo attached to ${report.title}`} className="max-h-[520px] w-full rounded-xl border border-[var(--border)] object-contain object-left" loading="lazy" /><figcaption className="mt-2 text-xs text-[var(--text-muted)]">Photo attached to this report</figcaption></figure>}
        {report.issueGroup?.reports?.length > 1 && <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
          <h2 className="text-sm font-semibold">Related campus reports</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Campus staff confirmed these reports describe the same issue. Each report remains separately tracked.</p>
          <ul className="mt-3 space-y-2">{report.issueGroup.reports.filter((item) => item._id !== report._id).map((item) => <li key={item._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2">
            <Link to={`/student/reports/${item._id}`} className="text-sm font-medium hover:text-[var(--accent-hover)]">{item.title}</Link><StatusBadge status={item.status} />
          </li>)}</ul>
          <p className="mt-3 text-xs text-[var(--text-muted)]">{report.issueGroup.urgencyVoteCount} combined urgency votes</p>
        </section>}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4"><div><p className="text-sm font-medium">Community urgency</p><p className="mt-1 text-xs text-[var(--text-muted)]">Your vote helps campus authorities understand what needs attention.</p></div><UrgencyVoteButton report={report} onChange={updateVote} /></div>
        <div className="mt-7 border-t border-[var(--border)] pt-6">
          <h2 className="text-sm font-semibold">Status progress</h2>
          {report.status === 'Rejected' ? <p className="mt-4 rounded-lg border border-[var(--error)]/20 bg-[var(--error)]/10 p-3 text-sm text-[var(--error)]">This report was reviewed and rejected.</p> : <StatusTimeline status={report.status} />}
        </div>
        <div className="mt-7 grid gap-4 border-t border-[var(--border)] pt-5 sm:grid-cols-2"><Info label="Location" value={report.location} icon={MapPin} /><Info label="Official priority" value={<PriorityBadge priority={report.priority} />} /><Info label="Created" value={formatDate(report.createdAt)} icon={CalendarDays} /><Info label="Last updated" value={formatDate(report.updatedAt)} icon={CalendarDays} /></div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3"><Link to="/student/reports" className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)]">My reports</Link><Link to="/student/problems" className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)]">All campus problems</Link></div>
    </div>
  )
}

function StatusTimeline({ status }) {
  const steps = ['Reported', 'Pending', 'In Progress', 'Resolved']
  const activeIndex = status === 'Pending' ? 1 : status === 'In Progress' ? 2 : 3
  return <ol className="mt-5 grid grid-cols-4">
    {steps.map((step, index) => {
      const reached = index <= activeIndex
      return <li key={step} className="relative text-center">
        {index > 0 && <span className={`absolute right-1/2 top-2.5 h-px w-full ${index <= activeIndex ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} />}
        <span className={`relative mx-auto grid size-5 place-items-center rounded-full border text-[10px] ${reached ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)]'}`}>{reached ? '✓' : index + 1}</span>
        <span className={`mt-2 block text-[10px] sm:text-xs ${index === activeIndex ? 'font-medium text-[var(--accent-hover)]' : 'text-[var(--text-muted)]'}`}>{step}</span>
      </li>
    })}
  </ol>
}

function Info({ label, value, icon: Icon }) {
  return <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-[var(--bg-secondary)] text-[var(--text-muted)]">{Icon ? <Icon size={16} /> : <span className="text-xs">•</span>}</span><div><p className="text-[10px] text-[var(--text-muted)]">{label}</p><div className="mt-1 text-sm">{value}</div></div></div>
}

export default ReportDetails
