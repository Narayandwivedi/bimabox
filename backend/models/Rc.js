const mongoose = require('mongoose')

const rcSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  vehicleNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  chassisNo: {
    type: String,
    trim: true
  },
  engineNo: {
    type: String,
    trim: true
  },
  make: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  rcFrontImage: {
    type: String,
    trim: true
  },
  rcBackImage: {
    type: String,
    trim: true
  },
  whatsappMessageCount: {
    type: Number,
    default: 0
  },
  lastWhatsappSentAt: {
    type: Date
  },
  lastWhatsappReminderFor: {
    type: String,
    trim: true
  },
  whatsappReminderStages: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
})

rcSchema.index({ vehicleNumber: 1 })
rcSchema.index({ createdAt: -1 })

const Rc = mongoose.model('Rc', rcSchema)

module.exports = Rc
