const SubscriptionPlan = require('../models/SubscriptionPlan')
const UserPlan = require('../models/UserPlan')
const { DEFAULT_PLANS } = require('./defaultPlans')
const { computeExpiryDate } = require('./planCycle')

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

// One-time data fix: the Free plan used to never expire (durationDays: 0). It's
// now valid for 1 year (durationDays: 365) — matches DEFAULT_PLANS.Free. This
// (1) patches the Free SubscriptionPlan's durationDays to 365, and (2) gives
// any existing Free UserPlan record (previously left with expiryDate: null)
// a concrete expiry, 1 year from its own startDate. Idempotent — a no-op once
// the Free plan is durationDays: 365 and no Free UserPlan record has a null
// expiryDate left over from the old "never expires" behaviour.
const applyFreePlanOneYearValidity = async () => {
  try {
    const freePlan = await SubscriptionPlan.findOne({ name: 'Free' })
    if (!freePlan) return

    if (freePlan.durationDays !== 365) {
      freePlan.durationDays = 365
      await freePlan.save()
      console.log('Updated Free plan durationDays to 365 (1 year validity).')
    }

    const staleFreePlans = await UserPlan.find({ planId: freePlan._id, expiryDate: null })
    for (const userPlan of staleFreePlans) {
      userPlan.expiryDate = computeExpiryDate(freePlan.durationDays, userPlan.startDate || userPlan.createdAt)
      await userPlan.save()
    }

    if (staleFreePlans.length > 0) {
      console.log(`Set 1-year expiry on ${staleFreePlans.length} existing Free plan record(s).`)
    }
  } catch (error) {
    console.error('Error applying Free plan 1-year validity:', error)
  }
}

module.exports = { seedDefaultPlansIfMissing, applyFreePlanOneYearValidity }
