import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { AUTH_COOKIE } from '../utils/generateToken.js'

export async function requireAuth(request, response, next) {
  const token = request.cookies[AUTH_COOKIE]
  if (!token) {
    response.status(401).json({ message: 'Please log in to continue.' })
    return
  }

  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    response.status(401).json({ message: 'Your session has expired. Please log in again.' })
    return
  }

  if (typeof payload === 'string' || typeof payload.sub !== 'string') {
    response.status(401).json({ message: 'Your session is invalid. Please log in again.' })
    return
  }
  const user = await User.findById(payload.sub).select('-password')
  if (!user) {
    response.status(401).json({ message: 'Your account could not be found. Please log in again.' })
    return
  }
  request.user = user
  next()
}
