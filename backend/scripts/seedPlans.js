require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const mongoose = require('mongoose')
const SubscriptionPlan = require('../models/SubscriptionPlan')

const plans = [
  {
    name: 'Free',
    price: 0,
    durationDays: 30,
    sortOrder: 1,
    features: {
      aiDocuments: 10,
      manualDocuments: 10,
      desktopAccess: true,
      mobileAppAccess: true,
      excelDownload: false,
      clientLimit: 20,
      appNotificationRenewal: true,
      whatsappRenewal: false,
      customizedPolicyDownload: false,
      processingSpeed: 'Standard',
      support: 'Standard',
    },
  },
  {
    name: 'Go',
    price: 99,
    durationDays: 90,
    sortOrder: 2,
    features: {
      aiDocuments: 100,
      manualDocuments: 0,
      desktopAccess: true,
      mobileAppAccess: true,
      excelDownload: true,
      clientLimit: 50,
      appNotificationRenewal: true,
      whatsappRenewal: false,
      customizedPolicyDownload: false,
      processingSpeed: 'Fast',
      support: 'Standard',
    },
  },
  {
    name: 'Plus',
    price: 199,
    durationDays: 30,
    sortOrder: 3,
    features: {
      aiDocuments: 500,
      manualDocuments: 0,
      desktopAccess: true,
      mobileAppAccess: true,
      excelDownload: true,
      clientLimit: 200,
      appNotificationRenewal: true,
      whatsappRenewal: true,
      customizedPolicyDownload: true,
      processingSpeed: 'Accelerated',
      support: 'Priority',
    },
  },
  {
    name: 'Pro',
    price: 499,
    durationDays: 30,
    sortOrder: 4,
    features: {
      aiDocuments: 1000,
      manualDocuments: 0,
      desktopAccess: true,
      mobileAppAccess: true,
      excelDownload: true,
      clientLimit: 0,
      appNotificationRenewal: true,
      whatsappRenewal: true,
      customizedPolicyDownload: true,
      processingSpeed: 'Highest',
      support: 'Priority',
    },
  },
]

async function seed() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/transport'
    await mongoose.connect(MONGODB_URI)
    console.log('MongoDB connected')

    for (const planData of plans) {
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
