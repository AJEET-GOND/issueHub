import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, MapPin, Tag } from 'lucide-react'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { getAdminInsights, reviewDuplicateGroup } from '../../services/adminService.js'
import { formatDate } from '../../utils/formatDate.js'

function AdminInsights() {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewingId, setReviewingId] = useState('')
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    let active = true
    getAdminInsights().then((data) => { if (active) setInsights(data) })
      .catch(() => { if (active) setError('Could not load campus insights. Please try again.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  if (loading) return <Loading label="Loading campus insights…" />
  if (error) return <p role="alert" className="text-sm text-[var(--error)]">{error}</p>

  async function reviewGroup(groupId, action) {
    setReviewingId(groupId)
    setReviewError('')
    try {
      await reviewDuplicateGroup(groupId, action)
      setInsights((current) => ({
        ...current,
        proposedDuplicateGroups: current.proposedDuplicateGroups.filter((group) => group._id !== groupId),
      }))
    } catch {
      setReviewError('Could not review this group. Please try again.')
    } finally {
      setReviewingId('')
    }
  }

  return (
    <div>
      <p className="text-xs font-medium text-[var(--accent-hover)]">Database-backed analysis</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Campus Insights</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">Spot recurring and unresolved issues using actual student reports and community urgency votes.</p>

      {insights.highConcern.length > 0 && <section className="mt-7 rounded-2xl border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-4 sm:p-6">
        <h2 className="text-base font-semibold text-[var(--warning)]">High Community Concern</h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Recurring, unresolved problems with at least {insights.threshold} urgency votes.</p>
        <div className="mt-4 grid gap-3 xl:grid-cols-2">{insights.highConcern.map((problem) => <ConcernCard key={`${problem.category}-${problem.location}-${problem.title}`} problem={problem} />)}</div>
      </section>}

      <section className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
        <h2 className="text-base font-semibold">Possible duplicate reports</h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Confirm related reports to group them in the student feed, or reject suggestions that describe different issues.</p>
        {reviewError && <p role="alert" className="mt-3 text-xs text-[var(--error)]">{reviewError}</p>}
        {insights.proposedDuplicateGroups.length ? <div className="mt-4 space-y-3">
          {insights.proposedDuplicateGroups.map((group) => <article key={group._id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-sm font-semibold">{group.title}</h3><p className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--text-muted)]"><Tag size={13} />{group.category}<span className="px-1">·</span><MapPin size={13} />{group.location}</p></div><span className="text-xs text-[var(--warning)]">{group.similarityScore}% similarity</span></div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">{group.reports.map((report) => <li key={report._id} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
              <Link to={`/admin/reports/${report._id}`} className="text-sm font-medium hover:text-[var(--accent-hover)]">{report.title}</Link>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{report.location} · {report.reportedBy?.name || 'Student'}</p>
              <div className="mt-2"><StatusBadge status={report.status} /></div>
            </li>)}</ul>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button type="button" disabled={reviewingId === group._id} onClick={() => reviewGroup(group._id, 'reject')} className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-50">{reviewingId === group._id ? 'Saving…' : 'Not related'}</button>
              <button type="button" disabled={reviewingId === group._id} onClick={() => reviewGroup(group._id, 'confirm')} className="rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50">{reviewingId === group._id ? 'Saving…' : 'Confirm group'}</button>
            </div>
          </article>)}
        </div> : <EmptyState title="No duplicate suggestions to review." description="Suggestions appear when new reports closely match existing issues." />}
      </section>

      <section aria-label="Confirmed issue group statistics" className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <GroupMetric label="Confirmed groups" value={insights.duplicateGroups.groupCount} />
        <GroupMetric label="Groups with 3+ reports" value={insights.duplicateGroups.groupsWithThreeOrMoreReports} />
        <GroupMetric label="Groups with open reports" value={insights.duplicateGroups.groupsWithUnresolvedReports} />
        <GroupMetric label="High community urgency" value={insights.duplicateGroups.groupsWithHighUrgency} />
      </section>

      <div className="mt-7 grid gap-6 xl:grid-cols-2">
        <InsightSection title="Community Urgency" subtitle="Problems receiving the most urgency votes." empty="No community urgency votes yet." items={insights.communityUrgency} render={(problem) => <ProblemCard key={`${problem.category}-${problem.location}-${problem.title}`} problem={problem} urgency />} />
        <InsightSection title="Recurring Problems" subtitle="Matching issue, location, and category reported more than once." empty="No recurring problems found." items={insights.recurringProblems} render={(problem) => <ProblemCard key={`${problem.category}-${problem.location}-${problem.title}`} problem={problem} />} />
        <InsightSection title="Unresolved Problems" subtitle="Reported problems that still have at least one open report." empty="No unresolved problems." items={insights.unresolvedProblems} render={(problem) => <ProblemCard key={`${problem.category}-${problem.location}-${problem.title}`} problem={problem} />} />
        <InsightSection title={`Long-Pending Problems · ${insights.pendingDaysThreshold}+ days`} subtitle="Open reports whose oldest unresolved report has been pending." empty="No long-pending problems." items={insights.longPendingProblems} render={(problem) => <ProblemCard key={`${problem.category}-${problem.location}-${problem.title}`} problem={problem} days /> } />
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Frequently Affected Locations</h2>
          {insights.affectedLocations.length ? <ul className="mt-4 divide-y divide-[var(--border)]">{insights.affectedLocations.map(({ location, reportCount }) => <li key={location} className="flex items-center justify-between gap-3 py-3 text-sm"><span className="inline-flex items-center gap-2 text-[var(--text-muted)]"><MapPin size={15} />{location}</span><span>{reportCount} {reportCount === 1 ? 'report' : 'reports'}</span></li>)}</ul> : <p className="mt-4 text-sm text-[var(--text-muted)]">No locations reported yet.</p>}
        </section>
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Most Reported Categories</h2>
          {insights.reportedCategories.length ? <ul className="mt-4 divide-y divide-[var(--border)]">{insights.reportedCategories.map(({ category, reportCount }) => <li key={category} className="flex items-center justify-between gap-3 py-3 text-sm"><span className="inline-flex items-center gap-2 text-[var(--text-muted)]"><Tag size={15} />{category}</span><span>{reportCount} {reportCount === 1 ? 'report' : 'reports'}</span></li>)}</ul> : <p className="mt-4 text-sm text-[var(--text-muted)]">No categories reported yet.</p>}
        </section>
      </div>
    </div>
  )
}

function GroupMetric({ label, value }) {
  return <article className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"><p className="text-xs text-[var(--text-muted)]">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></article>
}

function InsightSection({ title, subtitle, empty, items, render }) {
  return <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
    <h2 className="text-base font-semibold">{title}</h2><p className="mt-1 text-xs text-[var(--text-muted)]">{subtitle}</p>
    {items.length ? <div className="mt-4 space-y-3">{items.map(render)}</div> : <EmptyState title={empty} description="Insights update as reports and urgency votes are added." />}
  </section>
}

function ProblemCard({ problem, urgency = false, days = false }) {
  return <article className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-sm font-medium">{problem.title}</h3><p className="mt-1 text-xs text-[var(--text-muted)]">{problem.category} · {problem.location}</p></div>{problem.currentStatus && <StatusBadge status={problem.currentStatus} />}</div>
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--text-muted)]"><span>{problem.reportCount} {problem.reportCount === 1 ? 'report' : 'reports'}</span>{problem.unresolvedCount > 0 && <span>{problem.unresolvedCount} unresolved</span>}{urgency && <span className="inline-flex items-center gap-1 text-[var(--warning)]"><Flame size={13} />{problem.urgencyVoteCount} urgent votes</span>}{days && <span>Pending {problem.pendingDays} days</span>}{problem.oldestReportAt && <span>Oldest: {formatDate(problem.oldestReportAt)}</span>}</div>
  </article>
}

function ConcernCard({ problem }) {
  return <article className="rounded-xl border border-[var(--warning)]/20 bg-[var(--card)] p-4">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-sm font-semibold">{problem.title}</h3><p className="mt-1 text-xs text-[var(--text-muted)]">{problem.category} · {problem.location}</p></div><span className="rounded-full bg-[var(--warning)]/10 px-2.5 py-1 text-[10px] font-medium text-[var(--warning)]">HIGH CONCERN</span></div>
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text-muted)]"><span>{problem.reportCount} reports</span><span>{problem.unresolvedCount} unresolved</span><span className="inline-flex items-center gap-1 text-[var(--warning)]"><Flame size={13} />{problem.urgencyVoteCount} urgent votes</span></div>
    <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">Suggested action: {problem.suggestedAction}</p>
  </article>
}

export default AdminInsights
