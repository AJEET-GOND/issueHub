import { useState } from 'react'
import { Flame } from 'lucide-react'
import { removeUrgencyVote, voteUrgency } from '../services/reportService.js'

function UrgencyVoteButton({ report, onChange, compact = false }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function toggleVote() {
    setPending(true)
    setError('')
    try {
      const result = report.hasVoted
        ? await removeUrgencyVote(report._id)
        : await voteUrgency(report._id)
      onChange(report._id, result)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update your urgency vote.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        aria-pressed={Boolean(report.hasVoted)}
        disabled={pending}
        onClick={toggleVote}
        className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition disabled:cursor-wait disabled:opacity-60 ${report.hasVoted ? 'border-[var(--warning)]/40 bg-[var(--warning)]/10 text-[var(--warning)] hover:bg-[var(--warning)]/15' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--warning)]/50 hover:text-[var(--warning)]'} ${compact ? 'min-h-9' : 'min-h-11'}`}
      >
        <Flame size={15} />
        {pending ? 'Saving…' : report.hasVoted ? 'Remove urgent vote' : 'Mark as urgent'}
      </button>
      {!compact && <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><Flame size={13} className="text-[var(--warning)]" />{report.urgencyVoteCount ?? 0} urgent {(report.urgencyVoteCount ?? 0) === 1 ? 'vote' : 'votes'}{report.hasVoted && <span className="text-[var(--warning)]">· You marked this urgent</span>}</p>}
      {error && <p role="alert" className="mt-2 text-xs text-[var(--error)]">{error}</p>}
    </div>
  )
}

export default UrgencyVoteButton
