import { Link } from 'react-router-dom'

function NotFound() {
  return <main className="grid min-h-screen place-items-center px-5 text-center"><div><p className="text-sm font-medium text-[var(--accent-hover)]">404 · Page not found</p><h1 className="mt-3 text-3xl font-semibold">This page isn’t here.</h1><p className="mt-2 text-sm text-[var(--text-muted)]">The link may be outdated or the address may be incorrect.</p><Link to="/" className="mt-6 inline-block rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm text-white">Back to IssueHub</Link></div></main>
}

export default NotFound
