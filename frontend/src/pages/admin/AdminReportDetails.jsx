import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Flame, MapPin, Trash2 } from 'lucide-react'
import { deleteReport, getAdminReport, updateReportStatus } from '../../services/adminService.js'
import { formatDate } from '../../utils/formatDate.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import PriorityBadge from '../../components/PriorityBadge.jsx'
import Loading from '../../components/Loading.jsx'

const statuses = ['Pending', 'In Progress', 'Resolved', 'Rejected']

function AdminReportDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    getAdminReport(id).then((data) => { if (active) { setReport(data); setStatus(data.status) } })
      .catch((requestError) => { if (active) setError(requestError.response?.status === 404 ? 'Report not found.' : 'Could not load report details.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  async function saveStatus() {
    setSaving(true)
    setError('')
    setNotice('')
    try {
      setReport(await updateReportStatus(id, status))
      setNotice('Report status updated.')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update the report status.')
    } finally {
      setSaving(false)
    }
  }

  async function removeReport() {
    if (!window.confirm('Delete this report? This cannot be undone.')) return
    setError('')
    try {
      const result = await deleteReport(id)
      navigate('/admin/reports', { replace: true, state: { success: result.message || 'Report deleted.', warning: result.warning } })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete this report.')
    }
  }

  if (loading) return <Loading label="Loading report…" />
  if (!report) return <div><Link to="/admin/reports" className="text-xs text-[var(--text-muted)]">← All reports</Link><p role="alert" className="mt-5 text-sm text-[var(--error)]">{error || 'Report not found.'}</p></div>

  return <div><Link to="/admin/reports" className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--text)]"><ArrowLeft size={14} />All reports</Link><div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs text-[var(--text-muted)]">{report.category}</p><h1 className="mt-2 text-2xl font-semibold">{report.title}</h1></div><StatusBadge status={report.status} /></div><p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-[var(--text-muted)]">{report.description}</p>{report.imageUrl && <figure className="mt-6"><img src={report.imageUrl} alt={`Photo attached to ${report.title}`} className="max-h-[520px] w-full rounded-xl border border-[var(--border)] object-contain object-left" loading="lazy" /><figcaption className="mt-2 text-xs text-[var(--text-muted)]">Photo attached to this report</figcaption></figure>}{report.issueGroup?.reports?.length > 1 && <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4"><h2 className="text-sm font-semibold">Confirmed related reports</h2><ul className="mt-3 space-y-2">{report.issueGroup.reports.filter((item) => item._id !== report._id).map((item) => <li key={item._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2"><Link to={`/admin/reports/${item._id}`} className="text-sm font-medium hover:text-[var(--accent-hover)]">{item.title}</Link><StatusBadge status={item.status} /></li>)}</ul><p className="mt-3 text-xs text-[var(--text-muted)]">{report.issueGroup.urgencyVoteCount} combined urgency votes</p></section>}<div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[var(--warning)]/20 bg-[var(--warning)]/5 px-3 py-2 text-xs text-[var(--warning)]"><Flame size={15} />Community urgency: {report.urgencyVoteCount} {report.urgencyVoteCount === 1 ? 'vote' : 'votes'}</div><div className="mt-7 grid gap-4 border-t border-[var(--border)] pt-5 sm:grid-cols-2"><Info label="Location" value={report.location} icon={MapPin} /><Info label="Official priority" value={<PriorityBadge priority={report.priority} />} /><Info label="Submitted by" value={report.reportedBy?.name || 'Student'} /><Info label="Student email" value={report.reportedBy?.email || '—'} /><Info label="Created" value={formatDate(report.createdAt)} icon={CalendarDays} /><Info label="Last updated" value={formatDate(report.updatedAt)} icon={CalendarDays} /></div></div>
    <section className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6"><h2 className="text-sm font-semibold">Update report status</h2><div className="mt-3 flex flex-wrap gap-3"><select value={status} onChange={(event) => setStatus(event.target.value)} className="field-input w-auto min-w-44">{statuses.map((item) => <option key={item}>{item}</option>)}</select><button disabled={saving || status === report.status} onClick={saveStatus} className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Saving…' : 'Save status'}</button><button onClick={removeReport} className="ml-auto inline-flex items-center gap-2 rounded-lg border border-[var(--error)]/30 px-4 py-2.5 text-sm text-[var(--error)] hover:bg-[var(--error)]/10"><Trash2 size={15} />Delete report</button></div>{notice && <p role="status" className="mt-3 text-xs text-[var(--success)]">{notice}</p>}{error && <p role="alert" className="mt-3 text-xs text-[var(--error)]">{error}</p>}</section></div>
}

function Info({ label, value, icon: Icon }) {
  return <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-[var(--bg-secondary)] text-[var(--text-muted)]">{Icon ? <Icon size={16} /> : <span className="text-xs">•</span>}</span><div><p className="text-[10px] text-[var(--text-muted)]">{label}</p><div className="mt-1 break-all text-sm">{value}</div></div></div>
}

export default AdminReportDetails
