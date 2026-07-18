const mongoose = require('mongoose')

const featureSchema = new mongoose.Schema({
  aiDocuments: { type: Number, default: 0 },
  manualDocuments: { type: Number, default: 0 },
  desktopAccess: { type: Boolean, default: false },
  mobileAppAccess: { type: Boolean, default: false },
  excelDownload: { type: Boolean, default: false },
  clientLimit: { type: Number, default: 0 },
  appNotificationRenewal: { type: Boolean, default: false },
  whatsappRenewal: { type: Boolean, default: false },
  customizedPolicyDownload: { type: Boolean, default: false },
  processingSpeed: { type: String, enum: ['Standard', 'Fast', 'Accelerated', 'Highest'], default: 'Standard' },
  support: { type: String, enum: ['Standard', 'Priority'], default: 'Standard' },
}, { _id: false })

const subscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  price: { type: Number, required: true },
  durationDays: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  features: { type: featureSchema, default: () => ({}) },
}, { timestamps: true })

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema)
