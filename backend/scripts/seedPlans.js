require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const mongoose = require('mongoose')
const SubscriptionPlan = require('../models/SubscriptionPlan')
const UserPlan = require('../models/UserPlan')
const { DEFAULT_PLANS } = require('../utils/defaultPlans')

// Default behaviour: upsert by name (create missing, update existing in place —
// keeps each plan's _id, so UserPlan.planId references stay valid).
//
// Pass --reset (or RESET=true) to instead delete every existing plan and
// recreate them from scratch. This changes each plan's _id, so any UserPlan
// pointing at the old _id would break — the script remaps those references
// (matched by plan name) to the newly created plan automatically.
const RESET = process.argv.includes('--reset') || process.env.RESET === 'true'

async function seedUpsert() {
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
}

async function seedReset() {
  const oldPlans = await SubscriptionPlan.find({}).lean()
  const oldIdByName = new Map(oldPlans.map((p) => [p.name, p._id]))

  await SubscriptionPlan.deleteMany({})
  console.log(`Deleted ${oldPlans.length} existing plan(s)`)

  const created = await SubscriptionPlan.insertMany(DEFAULT_PLANS)
  console.log(`Created ${created.length} plan(s): ${created.map((p) => p.name).join(', ')}`)

  for (const plan of created) {
    const oldId = oldIdByName.get(plan.name)
    if (!oldId) continue
    const result = await UserPlan.updateMany({ planId: oldId }, { $set: { planId: plan._id } })
    if (result.modifiedCount > 0) {
      console.log(`Remapped ${result.modifiedCount} UserPlan record(s) from old "${plan.name}" plan to new one`)
    }
  }
}

async function seed() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/transport'
    await mongoose.connect(MONGODB_URI)
    console.log('MongoDB connected')
    console.log(RESET ? 'Mode: RESET (delete all + reseed)' : 'Mode: UPSERT (update in place)')

    if (RESET) {
      await seedReset()
    } else {
      await seedUpsert()
    }

    console.log('Seed completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  }
}

seed()
