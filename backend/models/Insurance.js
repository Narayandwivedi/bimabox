const mongoose = require('mongoose')

const INSURANCE_COMPANIES = [
  'HDFC ERGO',
  'ICICI Lombard',
  'Bajaj Allianz',
  'Tata AIG',
  'Reliance General',
  'IFFCO Tokio',
  'National Insurance',
  'New India Assurance',
  'Oriental Insurance',
  'United India Insurance',
  'Magma HDI',
  'Go Digit',
  'Acko',
  'Cholamandalam MS',
  'Future Generali',
  'Royal Sundaram',
  'SBI General',
  'Shriram General',
  'Liberty General',
  'Universal Sompo',
  'Kotak General',
  'Zuno General',
  'Raheja QBE',
  'Navi General',
  'Star Health',
  '' // Allow empty string
]

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
    trim: true,
    enum: INSURANCE_COMPANIES
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




