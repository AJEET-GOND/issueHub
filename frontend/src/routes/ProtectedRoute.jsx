import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Loading from '../components/Loading.jsx'
import { useAuth } from '../hooks/useAuth.js'

function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Loading label="Checking your session…" />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return user.role === 'student' ? <Outlet /> : <Navigate to="/admin/dashboard" replace />
}

export default ProtectedRoute
