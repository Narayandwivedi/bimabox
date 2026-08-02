const UserPlan = require('../models/UserPlan')
const { getPlan } = require('./planConfig')
const { computeExpiryDate } = require('./planCycle')

const FREE_PLAN_KEY = 'free'

// Every new user starts on the Free plan by default. Idempotent — safe to call
// even if a plan already exists for the user.
const assignFreePlanIfNone = async (userId) => {
  try {
    const existing = await UserPlan.findOne({ userId }).lean()
    if (existing) return

    const freePlan = getPlan(FREE_PLAN_KEY)
    if (!freePlan) return

    await UserPlan.create({
      userId,
      planKey: FREE_PLAN_KEY,
      startDate: new Date(),
      expiryDate: computeExpiryDate(freePlan.durationDays),
      status: 'active',
    })
  } catch (error) {
    console.error('Error assigning free plan:', error)
  }
}

module.exports = { assignFreePlanIfNone }
