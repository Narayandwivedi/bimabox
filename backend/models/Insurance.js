const mongoose = require('mongoose')

const INSURANCE_COMPANIES = [
  'Acko General Insurance Limited',
  'Bajaj Allianz General Insurance Company Limited',
  'Cholamandalam MS General Insurance Company Limited',
  'Navi General Insurance Limited',
  'Edelweiss General Insurance Company Limited',
  'Future Generali India Insurance Company Limited',
  'Go Digit General Insurance Limited',
  'HDFC ERGO General Insurance Company Limited',
  'ICICI Lombard General Insurance Company Limited',
  'IFFCO Tokio General Insurance Company Limited',
  'Kotak Mahindra General Insurance Company Limited',
  'Liberty General Insurance Limited',
  'Magma HDI General Insurance Company Limited',
  'Niva Bupa Health Insurance Company Limited',
  'National Insurance Company Limited',
  'Raheja QBE General Insurance Company Limited',
  'Reliance General Insurance Company Limited',
  'Royal Sundaram General Insurance Company Limited',
  'SBI General Insurance Company Limited',
  'Shriram General Insurance Company Limited',
  'Star Health & Allied Insurance Company Limited',
  'Tata AIG General Insurance Company Limited',
  'The New India Assurance Company Limited',
  'The Oriental Insurance Company Limited',
  'United India Insurance Company Limited',
  'Universal Sompo General Insurance Company Limited',
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

  imd: {
    type: String,
    trim: true
  },

  // Renewal tracking
  renewalStatus: {
    type: String,
    enum: ['pending', 'renewed', 'lost'],
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




