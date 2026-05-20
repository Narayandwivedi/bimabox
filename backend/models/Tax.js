const mongoose = require('mongoose')

const taxSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  vehicleNumber: {
    type: String,
    ref: 'VehicleRegistration',
    required: true,
    uppercase: true,
    trim: true
  },
  ownerName: {
    type: String,
    trim: true
  },
  mobileNumber: {
    type: String,
    trim: true
  },
  taxDocument: {
    type: String,
    trim: true
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  balanceAmount: {
    type: Number,
    default: 0
  },
  taxFrom: {
    type: String,
    required: true
  },
  taxTo: {
    type: String,
    required: true
  },



  // WhatsApp message tracking
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

// Optimized indexes for exact requirements:
// Optimized indexes for active tax lookups

// Index 1: vehicleNumber (for searching vehicle and getting all its tax records)
taxSchema.index({ vehicleNumber: 1 })

// Index 2: taxTo (for filtering expired/expiring_soon/active status)
taxSchema.index({ taxTo: 1 })


// Index 3: createdAt (for default sorting - newest first)
taxSchema.index({ createdAt: -1 })

const Tax = mongoose.model('Tax', taxSchema)

module.exports = Tax




