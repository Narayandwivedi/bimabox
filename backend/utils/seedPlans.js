const SubscriptionPlan = require('../models/SubscriptionPlan')
const UserPlan = require('../models/UserPlan')
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
    } else {
      await SubscriptionPlan.insertMany(missingPlans)
      console.log(`Seeded ${missingPlans.length} subscription plan(s): ${missingPlans.map((p) => p.name).join(', ')}`)
    }
  } catch (error) {
    console.error('Error auto-seeding subscription plans:', error)
  }
}

// One-time data fix: the Free plan used to expire after 30 days like any other
// plan. It's now meant to never expire (only its monthly usage limit resets).
// This (1) patches the Free SubscriptionPlan's durationDays to 0 so future
// assignments never get an expiry, and (2) clears expiryDate on any existing
// UserPlan record already tied to the Free plan. Idempotent — a no-op once
// the Free plan is durationDays: 0 and all its UserPlan records are cleared.
const clearFreePlanExpiries = async () => {
  try {
    const freePlan = await SubscriptionPlan.findOne({ name: 'Free' })
    if (!freePlan) return

    if (freePlan.durationDays !== 0) {
      freePlan.durationDays = 0
      await freePlan.save()
      console.log('Updated Free plan durationDays to 0 (never expires).')
    }

    const result = await UserPlan.updateMany(
      { planId: freePlan._id, expiryDate: { $ne: null } },
      { $set: { expiryDate: null } }
    )

    if (result.modifiedCount > 0) {
      console.log(`Cleared expiry on ${result.modifiedCount} existing Free plan record(s).`)
    }
  } catch (error) {
    console.error('Error clearing Free plan expiries:', error)
  }
}

module.exports = { seedDefaultPlansIfMissing, clearFreePlanExpiries }
