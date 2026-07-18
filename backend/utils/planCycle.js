const CYCLE_DAYS = 30

// durationDays === 0 means the plan never expires (e.g. Free) — only its
// monthly usage limit resets, handled separately by ensureCurrentCycle.
const computeExpiryDate = (durationDays, startDate = new Date()) => {
  if (!durationDays || durationDays <= 0) return null
  const expiry = new Date(startDate)
  expiry.setDate(expiry.getDate() + durationDays)
  return expiry
}

// A plan is currently valid if it's active AND either has no expiry (null)
// or its expiry date hasn't passed yet.
const activePlanExpiryFilter = () => ({
  $or: [{ expiryDate: null }, { expiryDate: { $gte: new Date() } }],
})

// Usage limits are always "per month" even on multi-month plans (e.g. Go = 3 months
// but 100 AI docs/month), so the usage counters reset every 30 days independently
// of the plan's overall expiry date.
const ensureCurrentCycle = async (userPlanDoc) => {
  const cycleStart = userPlanDoc.usage?.cycleStart || userPlanDoc.startDate || userPlanDoc.createdAt
  const cycleAgeMs = Date.now() - new Date(cycleStart).getTime()
  const cycleAgeDays = cycleAgeMs / (1000 * 60 * 60 * 24)

  if (cycleAgeDays >= CYCLE_DAYS) {
    userPlanDoc.usage.aiDocumentsUsed = 0
    userPlanDoc.usage.manualDocumentsUsed = 0
    userPlanDoc.usage.cycleStart = new Date()
    await userPlanDoc.save()
  }

  return userPlanDoc
}

module.exports = { ensureCurrentCycle, CYCLE_DAYS, computeExpiryDate, activePlanExpiryFilter }
