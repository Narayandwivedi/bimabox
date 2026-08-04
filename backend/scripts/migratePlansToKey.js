// One-time migration: SubscriptionPlan collection is being removed.
// Converts UserPlan.planId (ObjectId ref) and PaymentOrder.planId to planKey
// strings (free|go|plus|pro), then drops the subscriptionplans collection.
//
// Usage: node scripts/migratePlansToKey.js
require('dotenv').config()
const mongoose = require('mongoose')
const { BACKEND_PLANS } = require('../utils/planConfig')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/transport'

const nameToKey = Object.keys(BACKEND_PLANS).reduce((map, key) => {
  map[BACKEND_PLANS[key].name.toLowerCase()] = key
  return map
}, {})

const planKeyForName = (name) => {
  if (!name) return null
  const key = nameToKey[String(name).toLowerCase()]
  return key || 'free'
}

const migrate = async () => {
  const db = mongoose.connection.db
  const userPlansCol = db.collection('userplans')
  const paymentOrdersCol = db.collection('paymentorders')
  const subscriptionPlansCol = db.collection('subscriptionplans')

  // Snapshot the plans being dropped so we can map ObjectId -> name -> key.
  const planDocs = await subscriptionPlansCol.find({}).toArray()
  const idToName = new Map(planDocs.map((p) => [String(p._id), p.name]))
  console.log(`Found ${planDocs.length} SubscriptionPlan document(s) to map.`)

  const userPlanDocs = await userPlansCol.find({ planId: { $exists: true } }).toArray()
  let userPlanUpdated = 0
  let userPlanSkipped = 0
  for (const doc of userPlanDocs) {
    if (doc.planKey) {
      userPlanSkipped++
      continue
    }
    const name = doc.planId ? idToName.get(String(doc.planId)) : null
    const key = planKeyForName(name)
    await userPlansCol.updateOne({ _id: doc._id }, { $set: { planKey: key }, $unset: { planId: '' } })
    userPlanUpdated++
    console.log(`UserPlan ${doc._id}: planId ${doc.planId} (${name || 'unknown'}) -> planKey "${key}"`)
  }

  const paymentOrderDocs = await paymentOrdersCol.find({ planId: { $exists: true, $ne: null } }).toArray()
  let paymentOrderUpdated = 0
  for (const doc of paymentOrderDocs) {
    const name = doc.planId ? idToName.get(String(doc.planId)) : null
    const key = planKeyForName(name)
    await paymentOrdersCol.updateOne({ _id: doc._id }, { $set: { planKey: key }, $unset: { planId: '' } })
    paymentOrderUpdated++
    console.log(`PaymentOrder ${doc._id}: planId ${doc.planId} (${name || 'unknown'}) -> planKey "${key}"`)
  }

  await subscriptionPlansCol.drop().catch(() => {})
  console.log('Dropped subscriptionplans collection.')

  console.log(`\nDone. UserPlans updated: ${userPlanUpdated}, skipped: ${userPlanSkipped}. PaymentOrders updated: ${paymentOrderUpdated}.`)
}

mongoose
  .connect(MONGODB_URI, { socketTimeoutMS: 45000, serverSelectionTimeoutMS: 30000 })
  .then(async () => {
    console.log('MongoDB connected')
    await migrate()
    await mongoose.disconnect()
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
