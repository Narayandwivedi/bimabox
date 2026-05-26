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
    enum: ['PRIVATE CAR', '2W SCOOTER/ MOTORCYCLE', 'GCV - Public Carriers Othr Than 3W', 'TAXI 4W <=6 Psgr', '3W GCV - Public Carriers', '3W PCV <=6 Psgr', 'BUS & MAXI >= 4W & >6 Psgr', '3WH PCV >6 & <17 Psgr', 'Misc-D Special Vehicles', '']
  },

  insuranceClass: {
    type: String,
    trim: true,
    enum: ['Comprehensive', 'Third Party', '']
  },

  insuranceType: {
    type: String,
    trim: true,
    enum: ['Motor', 'Health', 'Life', 'Fire', 'Travel', 'Home Insurance', 'Crop Insurance', 'Property Insurance', '']
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

  totalFee: {
    type: Number,
    default: 0
  },

  paid: {
    type: Number,
    default: 0
  },

  balance: {
    type: Number,
    default: 0
  },

  feeBreakup: [
    {
      name: {
        type: String,
        trim: true
      },
      amount: {
        type: Number,
        default: 0
      }
    }
  ],

  // Additional Information
  remarks: {
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




