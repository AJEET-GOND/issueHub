import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'

function AdminLogin() {
  const { user, loginAdmin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />

  function onChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setPending(true)
    try {
      const authenticatedUser = await loginAdmin(form)
      navigate(authenticatedUser.role === 'admin' ? '/admin/dashboard' : '/student/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not sign in. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-[var(--bg)] lg:grid-cols-2">
      <section className="relative hidden overflow-hidden border-r border-[var(--border)] bg-[var(--bg-secondary)] p-12 lg:flex lg:flex-col lg:justify-between xl:p-16">
        <Link to="/" className="inline-flex w-fit items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"><ArrowLeft size={16} />IssueHub</Link>
        <div className="max-w-lg">
          <span className="grid size-12 place-items-center rounded-2xl bg-[var(--accent)]/15 text-[var(--accent-hover)]"><ShieldCheck size={23} /></span>
          <p className="mt-7 text-xs font-medium uppercase tracking-[.16em] text-[var(--accent-hover)]">Authority portal</p>
          <h1 className="mt-3 text-5xl font-semibold leading-tight tracking-[-.05em]">A clearer view of what campus needs.</h1>
          <p className="mt-5 text-base leading-7 text-[var(--text-muted)]">Review student reports, monitor progress, and help move campus issues toward resolution.</p>
        </div>
        <p className="text-xs text-[var(--text-muted)]">IssueHub · Campus authority access</p>
      </section>
      <section className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/login" className="mb-10 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"><ArrowLeft size={16} />Back to User Login</Link>
          <p className="text-xs font-medium uppercase tracking-[.15em] text-[var(--accent-hover)]">IssueHub Authority Portal</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Admin Login</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Sign in with your authorized administrator account.</p>
          {error && <p role="alert" className="mt-5 rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)]">{error}</p>}
          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            <label className="block text-sm font-medium">Admin Email<input required type="email" autoComplete="username" name="email" value={form.email} onChange={onChange} placeholder="admin@example.com" className="field-input mt-2" /></label>
            <label className="block text-sm font-medium">Password<input required type="password" autoComplete="current-password" name="password" value={form.password} onChange={onChange} placeholder="Your password" className="field-input mt-2" /></label>
            <button disabled={pending} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-60">{pending ? 'Please wait…' : 'Login as Admin'} {!pending && <ArrowRight size={16} />}</button>
          </form>
          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">Need an admin account? <Link to="/admin/signup" className="font-medium text-[var(--accent-hover)] hover:underline">Create Admin Account</Link></p>
          <p className="mt-4 text-center text-xs text-[var(--text-muted)]">Students should use the <Link to="/login" className="text-[var(--accent-hover)] hover:underline">user login</Link>.</p>
        </div>
      </section>
    </main>
  )
}

export default AdminLogin
