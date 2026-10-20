import { Router } from 'express'
import { deleteReport, getAdminDashboard, getAdminInsights, getAllReports, getMyReportById, reviewDuplicateGroup, updateReportStatus } from '../controllers/reportController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { requireAdmin } from '../middleware/adminMiddleware.js'

const router = Router()

router.use(requireAuth, requireAdmin)
router.get('/dashboard', getAdminDashboard)
router.get('/insights', getAdminInsights)
router.patch('/duplicate-groups/:id/confirm', (request, response, next) => {
  request.params.action = 'confirm'
  next()
}, reviewDuplicateGroup)
router.patch('/duplicate-groups/:id/reject', (request, response, next) => {
  request.params.action = 'reject'
  next()
}, reviewDuplicateGroup)
router.get('/reports', getAllReports)
router.get('/reports/:id', getMyReportById)
router.patch('/reports/:id/status', updateReportStatus)
router.delete('/reports/:id', deleteReport)

export default router
