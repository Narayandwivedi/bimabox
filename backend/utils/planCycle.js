const CYCLE_DAYS = 30

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

module.exports = { ensureCurrentCycle, CYCLE_DAYS }
