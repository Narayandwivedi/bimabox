require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const mongoose = require('mongoose')
const InsuranceCompany = require('../models/InsuranceCompany')

const COMPANIES = [
  'Acko General insu',
  'Aditya Birla Sun Life Insurance',
  'Aegon Life Insurance Company Limited',
  'Ageas Federal Life Insurance Company Limited',
  'Aviva Life Insurance Company India Ltd.',
  'Bajaj Allianz General Insurance Company Limited',
  'Bajaj Allianz Life Insurance Co. Ltd.',
  'Bharti AXA Life Insurance Company Ltd.',
  'Canara HSBC Life Insurance Company Limited',
  'Cholamandalam MS General Insurance Company Limited',
  'Edelweiss General Insurance Company Limited',
  'Edelweiss Tokio Life Insurance Company Limited',
  'Future Generali India Insurance Company Limited',
  'Future Generali India Life Insurance Company Limited',
  'Go Digit General Insurance Limited',
  'HDFC ERGO General Insurance Company Limited',
  'HDFC Life Insurance Co. Ltd.',
  'ICICI Lombard General Insurance Company Limited',
  'ICICI Prudential Life Insurance Co. Ltd.',
  'IFFCO Tokio General Insurance Company Limited',
  'IndiaFirst Life Insurance Company Ltd.',
  'Kotak Mahindra General Insurance Company Limited',
  'Kotak Mahindra Life Insurance Co. Ltd.',
  'Liberty General Insurance Limited',
  'Life Insurance Corporation of India (LIC)',
  'Magma HDI General Insurance Company Limited',
  'Max Life Insurance Co. Ltd.',
  'National Insurance Company Limited',
  'Navi General Insurance Limited',
  'Niva Bupa Health Insurance Company Limited',
  'PNB MetLife India Insurance Co. Ltd.',
  'Pramerica Life Insurance Co. Ltd.',
  'Raheja QBE General Insurance Company Limited',
  'Reliance General Insurance Company Limited',
  'Reliance Nippon Life Insurance Company Limited',
  'Royal Sundaram General Insurance Company Limited',
  'SBI General Insurance Company Limited',
  'SBI Life Insurance Co. Ltd.',
  'Sahara India Life Insurance Co. Ltd.',
  'Shriram General Insurance Company Limited',
  'Shriram Life Insurance Co. Ltd.',
  'Star Health & Allied Insurance Company Limited',
  'Star Union Dai-ichi Life Insurance Co. Ltd.',
  'Tata AIA Life Insurance Co. Ltd.',
  'Tata AIG General Insurance Company Limited',
  'The New India Assurance Company Limited',
  'The Oriental Insurance Company Limited',
  'United India Insurance Company Limited',
  'Universal Sompo General Insurance Company Limited',
]

async function seed() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/transport'
    await mongoose.connect(MONGODB_URI)
    console.log('MongoDB connected')

    for (const name of COMPANIES) {
      const existing = await InsuranceCompany.findOne({ name }).lean()
      if (existing) {
        console.log(`Already exists: ${name}`)
      } else {
        await InsuranceCompany.create({ name })
        console.log(`Created: ${name}`)
      }
    }

    console.log('Seed completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  }
}

seed()
