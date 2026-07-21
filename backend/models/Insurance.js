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

  // Snapshot of the company name at the time this record was saved (kept even if the company is later renamed)
  insuranceCompany: {
    type: String,
    trim: true
  },

  // Reference to the InsuranceCompany doc so renames/filtering stay correct going forward
  insuranceCompanyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InsuranceCompany',
    index: true
  },

  vehicleClass: {
    type: String,
    trim: true,
    enum: ['GCV', 'GCV-3W', 'Pvt. Car', 'Taxi', 'Two Wheeler', 'Mis-D', 'PCV', 'PCV-3W', 'Health', 'Life', 'Fire', 'Burglary', 'WC', 'CPM', 'Travel', 'Marine', 'GPA', 'GMC', 'CAR', 'IAR', 'EAR', 'SCHOOL BUS', 'LIABILITY', 'SECURITY BOND', '']
  },

  insuranceClass: {
    type: String,
    trim: true,
    enum: ['Comprehensive', 'Third Party', '']
  },

  product: {
    type: String,
    trim: true,
    enum: ['GCV', 'GCV-3W', 'Pvt. Car', 'Taxi', 'Two Wheeler', 'Mis-D', 'PCV', 'PCV-3W', 'Health', 'Life', 'Fire', 'Burglary', 'WC', 'CPM', 'Travel', 'Marine', 'GPA', 'GMC', 'CAR', 'IAR', 'EAR', 'SCHOOL BUS', 'LIABILITY', 'SECURITY BOND', '']
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

  // Third Party cover validity (long-term TP policies often differ from OD validity)
  tpValidFrom: {
    type: String,
    trim: true
  },
  tpValidTo: {
    type: String,
    trim: true
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

  // Premium breakdown
  odPremium: {
    type: Number,
    default: 0
  },
  tpPremium: {
    type: Number,
    default: 0
  },
  netPremium: {
    type: Number,
    default: 0
  },
  // Gross Premium (net premium + taxes) — kept as `premium` for backward compatibility
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
  renewalStatusChangedAt: {
    type: Date
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




