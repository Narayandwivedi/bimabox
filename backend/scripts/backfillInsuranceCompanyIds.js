// One-off migration: link existing Insurance records to their InsuranceCompany doc
// by matching the stored insuranceCompany string to a company name.
// Safe to re-run: only touches records where insuranceCompanyId is missing.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const mongoose = require('mongoose')
const Insurance = require('../models/Insurance')
const InsuranceCompany = require('../models/InsuranceCompany')

async function backfill() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/transport'
    await mongoose.connect(MONGODB_URI)
    console.log('MongoDB connected')

    const companies = await InsuranceCompany.find().lean()
    const byName = new Map(companies.map(c => [c.name.trim().toLowerCase(), c._id]))

    const records = await Insurance.find({
      insuranceCompany: { $exists: true, $ne: '' },
      insuranceCompanyId: { $exists: false }
    }).select('_id insuranceCompany').lean()

    let matched = 0
    let unmatched = 0

    for (const record of records) {
      const key = (record.insuranceCompany || '').trim().toLowerCase()
      const companyId = byName.get(key)
      if (companyId) {
        await Insurance.updateOne({ _id: record._id }, { $set: { insuranceCompanyId: companyId } })
        matched++
      } else {
        unmatched++
        console.log(`No company match for: "${record.insuranceCompany}" (record ${record._id})`)
      }
    }

    console.log(`Backfill complete. Matched: ${matched}, Unmatched: ${unmatched}`)
    process.exit(0)
  } catch (error) {
    console.error('Backfill failed:', error)
    process.exit(1)
  }
}

backfill()
