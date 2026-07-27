require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const mongoose = require('mongoose')
const ProductType = require('../models/ProductType')
const Insurance = require('../models/Insurance')

const PRODUCT_TYPES = [
  'GCV', 'GCV-3W', 'Pvt. Car', 'Taxi', 'Two Wheeler', 'Mis-D', 'PCV', 'PCV-3W',
  'Health', 'Life', 'Fire', 'Burglary', 'WC', 'CPM', 'Travel', 'Marine', 'GPA', 'GMC',
  'CAR', 'IAR', 'EAR', 'SCHOOL BUS', 'LIABILITY', 'SECURITY BOND'
]

async function seed() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/transport'
    await mongoose.connect(MONGODB_URI)
    console.log('MongoDB connected')

    let createdCount = 0
    let existingCount = 0

    for (const name of PRODUCT_TYPES) {
      const existing = await ProductType.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } }).lean()
      if (existing) {
        existingCount++
      } else {
        await ProductType.create({ name: name.trim() })
        console.log(`Created product type: ${name}`)
        createdCount++
      }
    }

    console.log(`Seeding complete. Created: ${createdCount}, Existing: ${existingCount}`)

    // Backfill productTypeId across existing Insurance records
    console.log('Backfilling productTypeIds on existing Insurance records...')
    const allTypes = await ProductType.find().lean()
    let updatedRecordsCount = 0

    for (const type of allTypes) {
      const escaped = type.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const result = await Insurance.updateMany(
        {
          $or: [{ productTypeId: { $exists: false } }, { productTypeId: null }],
          product: { $regex: new RegExp(`^${escaped}$`, 'i') }
        },
        { $set: { productTypeId: type._id } }
      )
      updatedRecordsCount += (result.modifiedCount || 0)
    }

    console.log(`Backfill complete. Updated ${updatedRecordsCount} Insurance records.`)
    process.exit(0)
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  }
}

seed()
