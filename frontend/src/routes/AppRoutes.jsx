import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout.jsx'
import StudentLayout from '../layouts/StudentLayout.jsx'
import AdminDashboard from '../pages/admin/AdminDashboard.jsx'
import AdminLogin from '../pages/admin/AdminLogin.jsx'
import AdminProfile from '../pages/admin/AdminProfile.jsx'
import AdminReportDetails from '../pages/admin/AdminReportDetails.jsx'
import AdminReports from '../pages/admin/AdminReports.jsx'
import AdminSignup from '../pages/admin/AdminSignup.jsx'
import AdminInsights from '../pages/admin/AdminInsights.jsx'
import NotFound from '../pages/NotFound.jsx'
import Home from '../pages/public/Home.jsx'
import Login from '../pages/public/Login.jsx'
import Signup from '../pages/public/Signup.jsx'
import ReportDetails from '../pages/student/ReportDetails.jsx'
import ReportIssue from '../pages/student/ReportIssue.jsx'
import MyReports from '../pages/student/MyReports.jsx'
import StudentDashboard from '../pages/student/StudentDashboard.jsx'
import CampusProblems from '../pages/student/CampusProblems.jsx'
import StudentProfile from '../pages/student/StudentProfile.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import AdminRoute from './AdminRoute.jsx'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/signup" element={<AdminSignup />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="problems" element={<CampusProblems />} />
          <Route path="report" element={<ReportIssue />} />
          <Route path="reports" element={<MyReports />} />
          <Route path="reports/:id" element={<ReportDetails />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>
      </Route>
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="insights" element={<AdminInsights />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="reports/:id" element={<AdminReportDetails />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
