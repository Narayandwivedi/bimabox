const UserPlan = require('../models/UserPlan')
const SubscriptionPlan = require('../models/SubscriptionPlan')

// Every new user starts on the Free plan by default. Idempotent — safe to call
// even if a plan already exists for the user.
const assignFreePlanIfNone = async (userId) => {
  try {
    const existing = await UserPlan.findOne({ userId }).lean()
    if (existing) return

    const freePlan = await SubscriptionPlan.findOne({ name: 'Free', isActive: true }).lean()
    if (!freePlan) return

    const expiry = new Date()
    expiry.setDate(expiry.getDate() + freePlan.durationDays)

    await UserPlan.create({
      userId,
      planId: freePlan._id,
      startDate: new Date(),
      expiryDate: expiry,
      status: 'active',
    })
  } catch (error) {
    console.error('Error assigning free plan:', error)
  }
}

module.exports = { assignFreePlanIfNone }
