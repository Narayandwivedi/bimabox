const SubscriptionPlan = require('../models/SubscriptionPlan')
const { DEFAULT_PLANS } = require('./defaultPlans')

// Runs on every server start. Only creates plans that don't exist yet (matched
// by name) — never overwrites a plan an admin has already edited, so this is
// safe to run unconditionally on every restart, not just on a fresh database.
const seedDefaultPlansIfMissing = async () => {
  try {
    const existingNames = new Set(
      (await SubscriptionPlan.find({}).select('name').lean()).map((p) => p.name)
    )

    const missingPlans = DEFAULT_PLANS.filter((plan) => !existingNames.has(plan.name))
    if (missingPlans.length === 0) {
      console.log('Subscription plans already seeded, skipping.')
      return
    }

    await SubscriptionPlan.insertMany(missingPlans)
    console.log(`Seeded ${missingPlans.length} subscription plan(s): ${missingPlans.map((p) => p.name).join(', ')}`)
  } catch (error) {
    console.error('Error auto-seeding subscription plans:', error)
  }
}

module.exports = { seedDefaultPlansIfMissing }
