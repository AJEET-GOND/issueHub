import api from './api.js'

export async function getAdminDashboard() {
  const { data } = await api.get('/admin/dashboard')
  return data
}

export async function getAdminInsights() {
  const { data } = await api.get('/admin/insights')
  return data.insights
}

export async function getAdminReports(filters = {}) {
  const { data } = await api.get('/admin/reports', { params: filters })
  return data.reports
}

export async function getAdminReport(id) {
  const { data } = await api.get(`/admin/reports/${id}`)
  return data.report
}

export async function updateReportStatus(id, status) {
  const { data } = await api.patch(`/admin/reports/${id}/status`, { status })
  return data.report
}

export async function deleteReport(id) {
  const { data } = await api.delete(`/admin/reports/${id}`)
  return data
}

export async function reviewDuplicateGroup(id, action) {
  const { data } = await api.patch(`/admin/duplicate-groups/${id}/${action}`)
  return data
}
