import { Router } from 'express'
import { adminLogin, adminSignup, login, logout, me, signup } from '../controllers/authController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/admin/login', adminLogin)
router.post('/admin/signup', adminSignup)
router.post('/logout', logout)
router.get('/me', requireAuth, me)

export default router
