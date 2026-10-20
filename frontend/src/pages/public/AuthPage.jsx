import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'

function AuthPage({ mode }) {
  const signupMode = mode === 'signup'
  const { user, login, signup, authError } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />

  function onChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    if (signupMode && form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setPending(true)
    try {
      const authenticatedUser = signupMode
        ? await signup({ name: form.name, email: form.email, password: form.password })
        : await login({ email: form.email, password: form.password })
      const fallback = authenticatedUser.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'
      navigate(location.state?.from?.pathname || fallback, { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || (signupMode ? 'Could not create your account. Please try again.' : 'Invalid email or password.'))
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-[var(--bg)] lg:grid-cols-2">
      <section className="relative hidden overflow-hidden border-r border-[var(--border)] bg-[var(--bg-secondary)] p-12 lg:flex lg:flex-col lg:justify-between xl:p-16">
        <Link to="/" className="inline-flex w-fit items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"><ArrowLeft size={16} /> IssueHub</Link>
        <div className="max-w-lg"><span className="grid size-12 place-items-center rounded-2xl bg-[var(--accent)]/15 text-[var(--accent-hover)]"><ShieldCheck size={23} /></span><h1 className="mt-7 text-5xl font-semibold leading-tight tracking-[-.05em]">{signupMode ? 'Small reports can make a big difference.' : 'Welcome back to a better campus.'}</h1><p className="mt-5 text-base leading-7 text-[var(--text-muted)]">A clearer way to share campus issues, keep track of progress, and make sure concerns are heard.</p></div>
        <p className="text-xs text-[var(--text-muted)]">IssueHub · Student issue reporting</p>
      </section>
      <section className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] lg:hidden"><ArrowLeft size={16} /> IssueHub</Link>
          <p className="text-xs font-medium uppercase tracking-[.15em] text-[var(--accent-hover)]">{signupMode ? 'Join IssueHub' : 'Your campus account'}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">{signupMode ? 'Create an account' : 'Login'}</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{signupMode ? 'Create a student account to submit and track issues.' : 'Sign in to continue to your IssueHub dashboard.'}</p>
          {(authError || error) && <p role="alert" className="mt-5 rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)]">{error || authError}</p>}
          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            {signupMode && <label className="block text-sm font-medium">Name<input required minLength={2} maxLength={80} autoComplete="name" name="name" value={form.name} onChange={onChange} placeholder="Your full name" className="field-input mt-2" /></label>}
            <label className="block text-sm font-medium">Email<input required type="email" autoComplete="email" name="email" value={form.email} onChange={onChange} placeholder="you@example.com" className="field-input mt-2" /></label>
            <label className="block text-sm font-medium">Password<input required type="password" minLength={8} maxLength={72} autoComplete={signupMode ? 'new-password' : 'current-password'} name="password" value={form.password} onChange={onChange} placeholder={signupMode ? 'At least 8 characters' : 'Your password'} className="field-input mt-2" /></label>
            {signupMode && <label className="block text-sm font-medium">Confirm password<input required type="password" minLength={8} maxLength={72} autoComplete="new-password" name="confirmPassword" value={form.confirmPassword} onChange={onChange} placeholder="Enter your password again" className="field-input mt-2" /></label>}
            <button disabled={pending} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-60">{pending ? 'Please wait…' : signupMode ? 'Create account' : 'Login'} {!pending && <ArrowRight size={16} />}</button>
          </form>
          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">{signupMode ? 'Already have an account?' : 'Don’t have an account?'} <Link to={signupMode ? '/login' : '/signup'} className="font-medium text-[var(--accent-hover)] hover:underline">{signupMode ? 'Login' : 'Sign up'}</Link></p>
          {signupMode && <p className="mt-5 text-center text-xs text-[var(--text-muted)]">New accounts are always created as students. Admin accounts use a separate protected signup.</p>}
          {signupMode ? (
            <div className="mt-5 text-center text-xs text-[var(--text-muted)]">Are you a campus authority? <Link to="/admin/login" className="font-medium text-[var(--accent-hover)] hover:underline">Admin Portal →</Link></div>
          ) : (
            <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
              <p className="text-xs font-medium uppercase tracking-[.12em] text-[var(--accent-hover)]">Campus authorities</p>
              <h3 className="mt-2 text-sm font-semibold">Need to manage reported issues?</h3>
              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Sign in to the IssueHub authority portal to review and track student reports.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/admin/login" className="rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-medium text-white hover:bg-[var(--accent-hover)]">Admin Login</Link>
                <Link to="/admin/signup" className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)]">Create Admin Account</Link>
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  )
}

export default AuthPage
