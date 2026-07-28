const User = require('../models/User')
const UserPlan = require('../models/UserPlan')
const Insurance = require('../models/Insurance')
const Rc = require('../models/Rc')
const PUC = require('../models/Puc')
const Tax = require('../models/Tax')
const GPS = require('../models/Gps')
const Fitness = require('../models/Fitness')
const Permit = require('../models/Permit')
const Kyc = require('../models/Kyc')

const DOCUMENT_MODELS = [
  { key: 'insurance', label: 'Insurance / Policy', model: Insurance },
  { key: 'rc', label: 'RC', model: Rc },
  { key: 'puc', label: 'PUC', model: PUC },
  { key: 'tax', label: 'Road Tax', model: Tax },
  { key: 'gps', label: 'GPS', model: GPS },
  { key: 'fitness', label: 'Fitness', model: Fitness },
  { key: 'permit', label: 'Permit', model: Permit },
  { key: 'kyc', label: 'KYC', model: Kyc },
]

const RANGE_HOURS = {
  '24h': 24,
  '7d': 7 * 24,
  '30d': 30 * 24,
  '60d': 60 * 24,
  '90d': 90 * 24,
  '6m': 182 * 24,
  '365d': 365 * 24,
  lifetime: null,
}

const getSinceDate = (range, now) => {
  const hours = RANGE_HOURS[range]
  if (hours == null) return null // lifetime — no lower bound
  return new Date(now.getTime() - hours * 60 * 60 * 1000)
}

const getStats = async (req, res) => {
  try {
    const now = new Date()
    const range = RANGE_HOURS[req.query.range] !== undefined ? req.query.range : '7d'
    const since = getSinceDate(range, now)
    const dateFilter = since ? { createdAt: { $gte: since } } : {}
    const activityFilter = since ? { lastActivity: { $gte: since } } : { lastActivity: { $ne: null } }

    const [totalUsers, activeUsersInRange, newUsersInRange, policyUploadsInRange, activePlansCount, newSubscriptionsInRange] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments(activityFilter),
      User.countDocuments(dateFilter),
      Insurance.countDocuments(dateFilter),
      UserPlan.countDocuments({ status: 'active' }),
      UserPlan.countDocuments(dateFilter),
    ])

    const usageAgg = await UserPlan.aggregate([
      {
        $group: {
          _id: null,
          totalAi: { $sum: { $ifNull: ['$usage.aiDocumentsUsed', 0] } },
          totalManual: { $sum: { $ifNull: ['$usage.manualDocumentsUsed', 0] } },
        },
      },
    ])
    const totalAiUploads = usageAgg[0]?.totalAi || 0
    const totalManualUploads = usageAgg[0]?.totalManual || 0

    const documentBreakdown = await Promise.all(
      DOCUMENT_MODELS.map(async ({ key, label, model }) => {
        const [total, inRange] = await Promise.all([
          model.countDocuments({}),
          model.countDocuments(dateFilter),
        ])
        return { key, label, total, inRange }
      })
    )

    const totalDocumentUploads = documentBreakdown.reduce((sum, d) => sum + d.total, 0)
    const totalDocumentUploadsInRange = documentBreakdown.reduce((sum, d) => sum + d.inRange, 0)

    res.json({
      success: true,
      data: {
        range,
        since,
        totalUsers,
        activeUsersInRange,
        newUsersInRange,
        activePlansCount,
        newSubscriptionsInRange,
        policyUploadsInRange,
        totalAiUploads,
        totalManualUploads,
        totalDocumentUploads,
        totalDocumentUploadsInRange,
        documentBreakdown,
        generatedAt: now,
      },
    })
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' })
  }
}

module.exports = { getStats }
