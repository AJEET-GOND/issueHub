import { Navigate, Outlet } from 'react-router-dom'
import Loading from '../components/Loading.jsx'
import { useAuth } from '../hooks/useAuth.js'

function AdminRoute() {
  const { user, loading } = useAuth()
  if (loading) return <Loading label="Checking your session…" />
  if (!user) return <Navigate to="/admin/login" replace />
  return user.role === 'admin' ? <Outlet /> : <Navigate to="/student/dashboard" replace />
}

export default AdminRoute
