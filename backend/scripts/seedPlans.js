require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const mongoose = require('mongoose')
const SubscriptionPlan = require('../models/SubscriptionPlan')
const { DEFAULT_PLANS } = require('../utils/defaultPlans')

async function seed() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/transport'
    await mongoose.connect(MONGODB_URI)
    console.log('MongoDB connected')

    for (const planData of DEFAULT_PLANS) {
      const existing = await SubscriptionPlan.findOne({ name: planData.name }).lean()
      if (existing) {
        await SubscriptionPlan.updateOne({ _id: existing._id }, { $set: planData })
        console.log(`Updated plan: ${planData.name}`)
      } else {
        await SubscriptionPlan.create(planData)
        console.log(`Created plan: ${planData.name}`)
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
