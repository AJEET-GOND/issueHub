import { Router } from 'express'
import adminRoutes from './adminRoutes.js'
import authRoutes from './authRoutes.js'
import reportRoutes from './reportRoutes.js'
import userRoutes from './userRoutes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/reports', reportRoutes)
router.use('/admin', adminRoutes)
router.use('/users', userRoutes)
router.get('/health', (_request, response) => response.json({ status: 'ok' }))

export default router
