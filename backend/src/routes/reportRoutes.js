import { Router } from 'express'
import { createReport, getCampusReports, getMyReportById, getMyReports, removeUrgencyVote, voteUrgency } from '../controllers/reportController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { requireStudent } from '../middleware/studentMiddleware.js'
import { receiveReportImage, validateReportImage } from '../middleware/reportImageUpload.js'

const router = Router()

router.use(requireAuth)
router.post('/', receiveReportImage, validateReportImage, createReport)
router.get('/my', getMyReports)
router.get('/', getCampusReports)
router.post('/:id/urgency', requireStudent, voteUrgency)
router.delete('/:id/urgency', requireStudent, removeUrgencyVote)
router.get('/:id', getMyReportById)

export default router
