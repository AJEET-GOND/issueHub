import api from './api.js'

export async function createReport(report, image, allowSimilar = false) {
  const formData = new FormData()
  for (const [field, value] of Object.entries(report)) {
    formData.append(field, value)
  }
  if (image) formData.append('image', image)
  if (allowSimilar) formData.append('allowSimilar', 'true')

  const { data } = await api.post('/reports', formData)
  return data.report
}

export async function getMyReports() {
  const { data } = await api.get('/reports/my')
  return data.reports
}

export async function getCampusReports(filters = {}) {
  const { data } = await api.get('/reports', { params: filters })
  return data.reports
}

export async function getMyReport(id) {
  const { data } = await api.get(`/reports/${id}`)
  return data.report
}

export async function voteUrgency(id) {
  const { data } = await api.post(`/reports/${id}/urgency`)
  return data
}

export async function removeUrgencyVote(id) {
  const { data } = await api.delete(`/reports/${id}/urgency`)
  return data
}
