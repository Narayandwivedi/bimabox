const mongoose = require('mongoose')

const userPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  notes: { type: String, trim: true },
  usage: {
    aiDocumentsUsed: { type: Number, default: 0 },
    manualDocumentsUsed: { type: Number, default: 0 },
  },
}, { timestamps: true })

userPlanSchema.index({ userId: 1, status: 1 })
userPlanSchema.index({ userId: 1, startDate: -1 })

module.exports = mongoose.model('UserPlan', userPlanSchema)
