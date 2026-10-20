import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Menu, ShieldCheck, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'

function Navbar({ section = 'IssueHub', links = [], publicPage = false }) {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleLogout() {
    setError('')
    const destination = user?.role === 'admin' ? '/admin/login' : '/login'
    try {
      await logout()
      navigate(destination, { replace: true })
    } catch {
      setError('Could not log out. Check your connection and try again.')
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-[var(--accent)] text-white"><ShieldCheck size={19} /></span>
          <span>Issue<span className="text-[var(--accent-hover)]">Hub</span><span className="ml-2 hidden text-xs font-normal text-[var(--text-muted)] sm:inline">{section}</span></span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ label, to }) => <Link key={to} to={to} className="rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] transition hover:bg-[var(--bg-secondary)] hover:text-[var(--text)]">{label}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {user && <Link to={user.role === 'admin' ? '/admin/profile' : '/student/profile'} className="max-w-40 truncate text-sm text-[var(--text-muted)] hover:text-[var(--text)]">{user.name}</Link>}
          {publicPage && !user ? <><Link to="/login" className="rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)]">Login</Link><Link to="/signup" className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]">Sign up</Link></> : <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-muted)] transition hover:border-[var(--error)]/50 hover:text-[var(--text)]"><LogOut size={15} />Logout</button>}
        </div>
        <button onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} className="grid size-10 place-items-center rounded-lg border border-[var(--border)] text-[var(--text)] md:hidden">{open ? <X size={18} /> : <Menu size={18} />}</button>
      </div>
      {error && <p role="alert" className="px-4 pb-2 text-right text-xs text-[var(--error)]">{error}</p>}
      {open && <nav className="flex flex-col border-t border-[var(--border)] bg-[var(--bg)] p-3 md:hidden">{links.map(({ label, to }) => <Link key={to} to={to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]">{label}</Link>)}{publicPage && !user ? <><Link to="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm text-[var(--text-muted)]">Login</Link><Link to="/signup" onClick={() => setOpen(false)} className="rounded-lg bg-[var(--accent)] px-3 py-3 text-sm text-white">Sign up</Link></> : <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg px-3 py-3 text-left text-sm text-[var(--text-muted)]"><LogOut size={15} />Logout</button>}</nav>}
    </header>
  )
}

export default Navbar
