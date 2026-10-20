import bcrypt from 'bcryptjs'
import { timingSafeEqual } from 'node:crypto'
import User from '../models/User.js'
import { clearAuthCookie, setAuthCookie, signAuthToken } from '../utils/generateToken.js'

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId || '',
  }
}

export async function signup(request, response) {
  const { name, email, password } = request.body
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
    response.status(400).json({ message: 'Enter a name between 2 and 80 characters.' })
    return
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    response.status(400).json({ message: 'Enter a valid email address.' })
    return
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    response.status(400).json({ message: 'Password must be between 8 and 72 characters.' })
    return
  }

  const normalizedEmail = email.trim().toLowerCase()
  if (await User.exists({ email: normalizedEmail })) {
    response.status(409).json({ message: 'An account with this email already exists.' })
    return
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: await bcrypt.hash(password, 12),
    role: 'student',
  })
  setAuthCookie(response, signAuthToken(user))
  response.status(201).json({ user: publicUser(user) })
}

export async function login(request, response) {
  const { email, password } = request.body
  if (typeof email !== 'string' || typeof password !== 'string') {
    response.status(400).json({ message: 'Enter your email and password.' })
    return
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password')
  if (!user || !(await bcrypt.compare(password, user.password))) {
    response.status(401).json({ message: 'Invalid email or password.' })
    return
  }

  setAuthCookie(response, signAuthToken(user))
  response.status(200).json({ user: publicUser(user) })
}

export async function adminSignup(request, response) {
  const { name, email, password, signupKey } = request.body
  const configuredKey = process.env.ADMIN_SIGNUP_KEY?.trim()
  if (!configuredKey) {
    response.status(503).json({ message: 'Admin signup is not configured. Set ADMIN_SIGNUP_KEY in backend/.env.' })
    return
  }
  if (typeof signupKey !== 'string') {
    response.status(403).json({ message: 'The admin signup key is invalid.' })
    return
  }
  const suppliedKey = Buffer.from(signupKey)
  const expectedKey = Buffer.from(configuredKey)
  if (suppliedKey.length !== expectedKey.length || !timingSafeEqual(suppliedKey, expectedKey)) {
    response.status(403).json({ message: 'The admin signup key is invalid.' })
    return
  }
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
    response.status(400).json({ message: 'Enter a name between 2 and 80 characters.' })
    return
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    response.status(400).json({ message: 'Enter a valid email address.' })
    return
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    response.status(400).json({ message: 'Password must be between 8 and 72 characters.' })
    return
  }

  const normalizedEmail = email.trim().toLowerCase()
  if (await User.exists({ email: normalizedEmail })) {
    response.status(409).json({ message: 'An account with this email already exists.' })
    return
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: await bcrypt.hash(password, 12),
    role: 'admin',
  })
  setAuthCookie(response, signAuthToken(user))
  response.status(201).json({ user: publicUser(user) })
}

export async function adminLogin(request, response) {
  const { email, password } = request.body
  if (typeof email !== 'string' || typeof password !== 'string') {
    response.status(400).json({ message: 'Enter your email and password.' })
    return
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password')
  if (!user || !(await bcrypt.compare(password, user.password))) {
    response.status(401).json({ message: 'Invalid email or password.' })
    return
  }
  if (user.role !== 'admin') {
    response.status(403).json({ message: 'You do not have administrator access.' })
    return
  }

  setAuthCookie(response, signAuthToken(user))
  response.status(200).json({ user: publicUser(user) })
}

export function logout(_request, response) {
  clearAuthCookie(response)
  response.status(200).json({ message: 'You have been logged out.' })
}

export function me(request, response) {
  response.status(200).json({ user: publicUser(request.user) })
}
