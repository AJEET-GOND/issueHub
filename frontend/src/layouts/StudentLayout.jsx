import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'

function StudentLayout() {
  const links = [
    { label: 'Dashboard', to: '/student/dashboard' },
    { label: 'Campus problems', to: '/student/problems' },
    { label: 'Report issue', to: '/student/report' },
    { label: 'My reports', to: '/student/reports' },
  ]
  return <><Navbar section="Student" links={links} /><div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[210px_1fr] lg:gap-10 lg:py-10"><aside><Sidebar role="student" /></aside><main className="min-w-0"><Outlet /></main></div></>
}

export default StudentLayout
