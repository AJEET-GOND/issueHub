import api from './api.js'

export async function getCurrentUser() {
  const { data } = await api.get('/auth/me')
  return data.user
}

export async function login(credentials) {
  await api.post('/auth/login', credentials)
  return getCurrentUser()
}

export async function loginAdmin(credentials) {
  await api.post('/auth/admin/login', credentials)
  return getCurrentUser()
}

export async function signup(details) {
  await api.post('/auth/signup', details)
  return getCurrentUser()
}

export async function signupAdmin(details) {
  await api.post('/auth/admin/signup', details)
  return getCurrentUser()
}

export async function logout() {
  await api.post('/auth/logout')
}

export async function getProfile() {
  const { data } = await api.get('/users/profile')
  return data.user
}

export async function updateProfile(updates) {
  const { data } = await api.put('/users/profile', updates)
  return data.user
}
