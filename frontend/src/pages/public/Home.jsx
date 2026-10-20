import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardCheck, ShieldCheck, UsersRound } from 'lucide-react'
import Navbar from '../../components/Navbar.jsx'
import { useAuth } from '../../hooks/useAuth.js'

const features = [
  { icon: ClipboardCheck, title: 'Report clearly', text: 'Share what needs attention, where it is, and how urgent it feels.' },
  { icon: ShieldCheck, title: 'Track progress', text: 'See your report status and follow updates from the campus team.' },
  { icon: UsersRound, title: 'One campus, working together', text: 'Give students and authorized staff one simple place to act.' },
]

function Home() {
  const { user } = useAuth()
  const dashboard = user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'

  return (
    <>
      <Navbar publicPage />
      <main>
        <section className="mx-auto grid min-h-[590px] max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.12fr_.88fr] lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--text-muted)]"><span className="size-1.5 rounded-full bg-[var(--success)]" /> A better way to care for campus</span>
            <h1 className="mt-6 max-w-2xl text-5xl font-semibold leading-[1.05] tracking-[-.055em] sm:text-6xl lg:text-[68px]">See an issue?<br /><span className="text-[var(--accent-hover)]">Let’s fix it.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[var(--text-muted)]">IssueHub helps students report campus issues and follow them through to resolution. Clear reports. Visible progress. A campus that works better for everyone.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={user ? dashboard : '/signup'} className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)]">{user ? 'Open your dashboard' : 'Report an issue'} <ArrowRight size={16} /></Link>
              {!user && <Link to="/login" className="rounded-xl border border-[var(--border)] px-5 py-3.5 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--bg-secondary)]">Login</Link>}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-8 rounded-full bg-[var(--accent)]/10 blur-3xl" />
            <div className="relative rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xl sm:p-7">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4"><div><p className="text-xs text-[var(--text-muted)]">IssueHub</p><h2 className="mt-1 text-lg font-semibold">Report an issue</h2></div><span className="grid size-10 place-items-center rounded-xl bg-[var(--accent)]/15 text-[var(--accent-hover)]"><ClipboardCheck size={19} /></span></div>
              <div className="mt-5 space-y-4"><div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4"><p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">What needs attention?</p><div className="mt-2 h-3 w-3/4 rounded bg-[var(--border)]" /></div><div className="grid grid-cols-2 gap-3"><div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4"><p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Category</p><p className="mt-2 text-xs">Infrastructure</p></div><div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4"><p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Priority</p><p className="mt-2 text-xs text-[var(--warning)]">Medium</p></div></div><div className="rounded-xl bg-[var(--accent)] px-4 py-3 text-center text-xs font-medium text-white">Submit report</div></div>
              <p className="mt-4 text-center text-[10px] text-[var(--text-muted)]">Illustration only — no sample reports are stored.</p>
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--border)] bg-[var(--bg-secondary)]/60">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
            <div className="max-w-xl"><p className="text-xs font-medium uppercase tracking-[.16em] text-[var(--accent-hover)]">Simple by design</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">From report to resolution.</h2><p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">IssueHub keeps the process clear for students and staff.</p></div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">{features.map(({ icon: Icon, title, text }, index) => <article key={title} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-[var(--accent)]/15 text-[var(--accent-hover)]"><Icon size={18} /></span><span className="text-xs text-[var(--text-muted)]">0{index + 1}</span></div><h3 className="mt-5 text-base font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{text}</p></article>)}</div>
          </div>
        </section>
        <section className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-5 py-14 sm:px-8 sm:py-16 md:flex-row md:items-center"><div><h2 className="text-2xl font-semibold tracking-tight">Make your campus better, one report at a time.</h2><p className="mt-2 text-sm text-[var(--text-muted)]">Create an account to submit issues and follow their progress.</p></div><Link to={user ? dashboard : '/signup'} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white hover:bg-[var(--accent-hover)]">{user ? 'Go to dashboard' : 'Get started'} <ArrowRight size={16} /></Link></section>
        {!user && <section className="border-t border-[var(--border)] bg-[var(--bg-secondary)]/50"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 sm:px-8 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-medium">Are you a campus authority?</p><p className="mt-1 text-xs text-[var(--text-muted)]">Manage student reports in the IssueHub Authority Portal.</p></div><div className="flex flex-wrap gap-2"><Link to="/admin/login" className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-xs font-medium hover:border-[var(--accent)]">Admin Login</Link><Link to="/admin/signup" className="rounded-lg px-4 py-2.5 text-xs font-medium text-[var(--accent-hover)] hover:bg-[var(--card)]">Create Admin Account</Link></div></div></section>}
      </main>
      <footer className="border-t border-[var(--border)] px-5 py-6 text-center text-xs text-[var(--text-muted)]">IssueHub · A student-first campus issue reporting platform</footer>
    </>
  )
}

export default Home
