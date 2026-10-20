import jwt from 'jsonwebtoken'

export const AUTH_COOKIE = 'campusfix_token'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000

function authCookieOptions() {
  const sameSite = process.env.AUTH_COOKIE_SAME_SITE === 'none' ? 'none' : 'lax'
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
    sameSite,
    path: '/',
  }
}

export function signAuthToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  )
}

export function setAuthCookie(response, token) {
  response.cookie(AUTH_COOKIE, token, {
    ...authCookieOptions(),
    maxAge: COOKIE_MAX_AGE,
  })
}

export function clearAuthCookie(response) {
  response.clearCookie(AUTH_COOKIE, authCookieOptions())
}
