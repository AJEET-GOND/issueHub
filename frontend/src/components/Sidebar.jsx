import { NavLink } from 'react-router-dom'
import { ClipboardList, LayoutDashboard, PlusCircle, UserRound, UsersRound } from 'lucide-react'

const studentLinks = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/problems', label: 'Campus problems', icon: UsersRound },
  { to: '/student/report', label: 'Report an issue', icon: PlusCircle },
  { to: '/student/reports', label: 'My reports', icon: ClipboardList },
  { to: '/student/profile', label: 'Profile', icon: UserRound },
]
const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/reports', label: 'All reports', icon: ClipboardList },
  { to: '/admin/profile', label: 'Profile', icon: UserRound },
]

function Sidebar({ role }) {
  const links = role === 'admin' ? adminLinks : studentLinks
  return (
    <nav aria-label={`${role} navigation`} className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:block lg:space-y-1">
      {links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-2 rounded-xl px-3 py-3 text-xs transition sm:text-sm ${isActive ? 'bg-[var(--accent)]/15 font-medium text-[var(--accent-hover)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text)]'}`}><Icon size={16} />{label}</NavLink>)}
    </nav>
  )
}

export default Sidebar
