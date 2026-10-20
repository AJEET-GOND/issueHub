import mongoose from 'mongoose'

const issueGroupSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, required: true },
  location: { type: String, required: true, trim: true, maxlength: 160 },
  reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true }],
  status: { type: String, enum: ['confirmed', 'proposed', 'rejected', 'merged'], required: true },
  similarityScore: { type: Number, min: 0, max: 100, default: 100 },
}, { timestamps: true })

issueGroupSchema.index({ status: 1, reports: 1 })

const IssueGroup = mongoose.model('IssueGroup', issueGroupSchema)

export default IssueGroup
