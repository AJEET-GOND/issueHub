import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getMyReports } from '../../services/reportService.js'
import ReportList from '../../components/ReportList.jsx'

function MyReports() {
  const location = useLocation()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setReports(await getMyReports()) } catch { setError('Could not load your reports.') } finally { setLoading(false) }
  }, [])
  useEffect(() => {
    let active = true
    getMyReports().then((data) => { if (active) setReports(data) })
      .catch(() => { if (active) setError('Could not load your reports.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return <div><h1 className="text-2xl font-semibold tracking-tight">My reports</h1><p className="mt-2 text-sm text-[var(--text-muted)]">Review issues you’ve submitted and their latest status.</p>{location.state?.success && <p role="status" className="mt-4 rounded-lg border border-[var(--success)]/20 bg-[var(--success)]/10 p-3 text-sm text-[var(--success)]">{location.state.success}</p>}<div className="mt-6"><ReportList reports={reports} loading={loading} error={error} toPrefix="/student/reports" emptyTitle="No reports found." onRetry={load} /></div></div>
}

export default MyReports
