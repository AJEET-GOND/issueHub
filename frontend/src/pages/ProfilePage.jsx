import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { getProfile } from '../services/authService.js'
import Loading from '../components/Loading.jsx'

function ProfilePage({ role }) {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    getProfile().then((profile) => {
      if (active) { setName(profile.name); setStudentId(profile.studentId || '') }
    }).catch(() => { if (active) setError('Could not load your profile.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await updateProfile({ name, ...(role === 'student' ? { studentId } : {}) })
      setNotice('Profile updated.')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update your profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading label="Loading profile…" />

  return <div className="max-w-2xl"><h1 className="text-2xl font-semibold tracking-tight">Profile</h1><p className="mt-2 text-sm text-[var(--text-muted)]">Your account information.</p><form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-7">{error && <p role="alert" className="text-sm text-[var(--error)]">{error}</p>}<label className="block text-sm font-medium">Name<input required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className="field-input mt-2" /></label><label className="block text-sm font-medium">Email<input value={user.email} readOnly className="field-input mt-2 cursor-not-allowed opacity-70" /></label>{role === 'student' && <label className="block text-sm font-medium">Student ID <span className="font-normal text-[var(--text-muted)]">(optional)</span><input maxLength={40} value={studentId} onChange={(event) => setStudentId(event.target.value)} className="field-input mt-2" /></label>}<label className="block text-sm font-medium">Account role<input value={role} readOnly className="field-input mt-2 cursor-not-allowed capitalize opacity-70" /></label><div className="flex flex-wrap items-center gap-4"><button disabled={saving} className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-60">{saving ? 'Saving…' : 'Save changes'}</button>{notice && <p role="status" className="text-sm text-[var(--success)]">{notice}</p>}</div></form></div>
}

export default ProfilePage
