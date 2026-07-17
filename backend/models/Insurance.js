const mongoose = require('mongoose')

const InsuranceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Policy Information
  policyNumber: {
    type: String,
    trim: true,
    uppercase: true
  },

  policyHolderName: {
    type: String,
    trim: true
  },

  mobileNumber: {
    type: String,
    trim: true
  },

  insuranceCompany: {
    type: String,
    trim: true
  },

  vehicleClass: {
    type: String,
    trim: true,
    enum: ['GCV', 'GCV-3W', 'Pvt. Car', 'Taxi', 'Two Wheeler', 'Mis-D', 'PCV', 'PCV-3W', 'Health', 'Life', 'Fire', 'Burglary', 'WC', 'CPM', 'Travel', 'Marine', 'GPA', 'GMC', '']
  },

  insuranceClass: {
    type: String,
    trim: true,
    enum: ['Comprehensive', 'Third Party', '']
  },

  product: {
    type: String,
    trim: true,
    enum: ['GCV', 'GCV-3W', 'Pvt. Car', 'Taxi', 'Two Wheeler', 'Mis-D', 'PCV', 'PCV-3W', 'Health', 'Life', 'Fire', 'Burglary', 'WC', 'CPM', 'Travel', 'Marine', 'GPA', 'GMC', '']
  },

  // Vehicle Information
  vehicleNumber: {
    type: String,
    ref: 'VehicleRegistration',
    trim: true,
    uppercase: true,
  },


  validFrom: {
    type: String,
    required: true
  },
  validTo: {
    type: String,
    required: true
  },

  issueDate: {
    type: String
  },



  // Insurance Document
  insuranceDocument: {
    type: String,
    trim: true
  },

  endorsementDocument: {
    type: String,
    trim: true
  },

  endorsementDocuments: [{
    type: String,
    trim: true
  }],

  premium: {
    type: Number,
    default: 0
  },

  // Additional Information
  remarks: {
    type: String,
    trim: true
  },

  reference: {
    type: String,
    trim: true
  },

  imd: {
    type: String,
    trim: true
  },

  // Claim tracking
  claimRaised: {
    type: Boolean,
    default: false
  },
  claimDate: {
    type: String,
    trim: true
  },
  claimRemarks: {
    type: String,
    trim: true
  },

  // Renewal tracking
  renewalStatus: {
    type: String,
    enum: ['pending', 'renewed', 'lost', 'opportunity'],
    default: 'pending'
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
  timestamps: true // Automatically adds createdAt and updatedAt fields
})



const Insurance = mongoose.model('Insurance', InsuranceSchema)

module.exports = Insurance




