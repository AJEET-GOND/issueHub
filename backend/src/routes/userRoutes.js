import { Router } from 'express'
import { getProfile, updateProfile } from '../controllers/userController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()

router.use(requireAuth)
router.get('/profile', getProfile)
router.put('/profile', updateProfile)

export default router
