import mongoose from 'mongoose'

export const REPORT_CATEGORIES = [
  'Infrastructure',
  'Electrical',
  'Water',
  'Cleanliness',
  'Internet',
  'Other',
]
export const REPORT_PRIORITIES = ['Low', 'Medium', 'High']
export const REPORT_STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected']

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 4, maxlength: 120 },
  description: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
  category: { type: String, required: true, enum: REPORT_CATEGORIES },
  location: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
  priority: { type: String, required: true, enum: REPORT_PRIORITIES, default: 'Medium' },
  status: { type: String, required: true, enum: REPORT_STATUSES, default: 'Pending' },
  imageUrl: { type: String, trim: true, maxlength: 2048 },
  imageFileId: { type: String, trim: true, maxlength: 160 },
  issueGroupId: { type: mongoose.Schema.Types.ObjectId, ref: 'IssueGroup', index: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: true })

const Report = mongoose.model('Report', reportSchema)

export default Report
