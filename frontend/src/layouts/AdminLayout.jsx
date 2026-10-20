import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Activity, ClipboardList, LayoutDashboard, LogOut, Menu, ShieldCheck, UserRound, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'

const links = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Reports', to: '/admin/reports', icon: ClipboardList },
  { label: 'Insights', to: '/admin/insights', icon: Activity },
  { label: 'Profile', to: '/admin/profile', icon: UserRound },
]

function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [error, setError] = useState('')

  async function handleLogout() {
    setError('')
    try {
      await logout()
      navigate('/admin/login', { replace: true })
    } catch {
      setError('Could not log out. Check your connection and try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-[var(--accent)] text-white"><ShieldCheck size={19} /></span>
            <div><p className="font-semibold tracking-tight">Campus<span className="text-[var(--accent-hover)]">Fix</span></p><p className="text-[10px] uppercase tracking-[.14em] text-[var(--text-muted)]">Authority Portal</p></div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-48 truncate text-sm text-[var(--text-muted)] sm:inline">{user?.name}</span>
            <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} className="grid size-10 place-items-center rounded-lg border border-[var(--border)] lg:hidden">{menuOpen ? <X size={18} /> : <Menu size={18} />}</button>
          </div>
        </div>
      </header>
      {error && <p role="alert" className="mx-auto max-w-[1440px] px-4 py-2 text-right text-xs text-[var(--error)] sm:px-6">{error}</p>}
      {menuOpen && <nav aria-label="Admin navigation" className="border-b border-[var(--border)] bg-[var(--bg-secondary)] p-3 lg:hidden"><Navigation onNavigate={() => setMenuOpen(false)} /><LogoutButton onLogout={handleLogout} /></nav>}
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[240px_1fr]">
        <aside className="hidden min-h-[calc(100vh-4rem)] border-r border-[var(--border)] px-4 py-7 lg:flex lg:flex-col">
          <p className="px-3 text-[10px] font-medium uppercase tracking-[.16em] text-[var(--text-muted)]">Manage campus issues</p>
          <Navigation />
          <div className="mt-auto border-t border-[var(--border)] pt-4"><p className="truncate px-3 text-sm font-medium">{user?.name}</p><p className="truncate px-3 pt-1 text-xs text-[var(--text-muted)]">{user?.email}</p><LogoutButton onLogout={handleLogout} /></div>
        </aside>
        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-9 lg:py-9"><Outlet /></main>
      </div>
    </div>
  )
}

function Navigation({ onNavigate }) {
  return <nav aria-label="Admin navigation" className="mt-4 grid gap-1">{links.map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} onClick={onNavigate} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${isActive ? 'bg-[var(--accent)]/15 font-medium text-[var(--accent-hover)]' : 'text-[var(--text-muted)] hover:bg-[var(--card)] hover:text-[var(--text)]'}`}><Icon size={17} />{label}</NavLink>)}</nav>
}

function LogoutButton({ onLogout }) {
  return <button type="button" onClick={onLogout} className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[var(--text-muted)] transition hover:bg-[var(--error)]/10 hover:text-[var(--error)]"><LogOut size={17} />Logout</button>
}

export default AdminLayout
