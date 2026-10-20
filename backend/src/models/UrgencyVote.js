import mongoose from 'mongoose'

const urgencyVoteSchema = new mongoose.Schema({
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: { createdAt: true, updatedAt: false } })

urgencyVoteSchema.index({ report: 1, user: 1 }, { unique: true })
urgencyVoteSchema.index({ report: 1 })

const UrgencyVote = mongoose.model('UrgencyVote', urgencyVoteSchema)

export default UrgencyVote
