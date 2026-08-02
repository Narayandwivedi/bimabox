const UserPlan = require('../models/UserPlan')
const User = require('../models/User')
const Vehicle = require('../models/Vehicle')
const { getPlan } = require('../utils/planConfig')
const { ensureCurrentCycle, computeExpiryDate, activePlanExpiryFilter } = require('../utils/planCycle')

const FREE_PLAN_KEY = 'free'

const planName = (planKey) => {
  const plan = getPlan(planKey)
  return plan ? plan.name : planKey
}

const listUserPlans = async (req, res) => {
  try {
    const { search, planKey, status } = req.query
    const filter = {}

    if (planKey) filter.planKey = planKey
    if (status) filter.status = status

    let userFilter = {}
    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } },
        ],
      }).select('_id').lean()
      userFilter = { userId: { $in: users.map((u) => u._id) } }
    }

    const combinedFilter = { ...filter, ...userFilter }

    const plans = await UserPlan.find(combinedFilter)
      .populate('userId', 'name mobile email isActive')
      .sort({ createdAt: -1 })
      .lean()

    const data = plans.map((up) => ({
      ...up,
      planName: planName(up.planKey),
    }))

    res.json({ success: true, data })
  } catch (error) {
    console.error('Error listing user plans:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch user plans' })
  }
}

const assignPlan = async (req, res) => {
  try {
    const { userId, planKey, startDate, notes } = req.body

    if (!userId || !planKey) {
      return res.status(400).json({ success: false, message: 'userId and planKey are required' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const plan = getPlan(planKey)
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' })
    }

    const effectiveStartDate = startDate ? new Date(startDate) : new Date()
    const expiryDate = computeExpiryDate(plan.durationDays, effectiveStartDate)

    await UserPlan.updateMany(
      { userId, status: 'active' },
      { $set: { status: 'expired' } }
    )

    const userPlan = await UserPlan.create({
      userId,
      planKey,
      startDate: effectiveStartDate,
      expiryDate,
      status: 'active',
      assignedBy: req.adminId || req.admin?._id,
      notes: notes || '',
    })

    const populated = await UserPlan.findById(userPlan._id)
      .populate('userId', 'name mobile email isActive')
      .lean()

    res.status(201).json({ success: true, data: { ...populated, planName: planName(planKey) } })
  } catch (error) {
    console.error('Error assigning plan:', error)
    res.status(500).json({ success: false, message: 'Failed to assign plan' })
  }
}

const updateUserPlan = async (req, res) => {
  try {
    const userPlanId = req.params.id
    const { planKey, expiryDate, status, notes } = req.body

    const userPlan = await UserPlan.findById(userPlanId)
    if (!userPlan) {
      return res.status(404).json({ success: false, message: 'User plan not found' })
    }

    if (planKey !== undefined) {
      const plan = getPlan(planKey)
      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plan not found' })
      }
      userPlan.planKey = planKey

      if (!expiryDate) {
        userPlan.expiryDate = computeExpiryDate(plan.durationDays, userPlan.startDate || new Date())
      }
    }

    if (expiryDate !== undefined) userPlan.expiryDate = expiryDate ? new Date(expiryDate) : null
    if (status !== undefined) userPlan.status = status
    if (notes !== undefined) userPlan.notes = notes

    await userPlan.save()

    const populated = await UserPlan.findById(userPlan._id)
      .populate('userId', 'name mobile email isActive')
      .lean()

    res.json({ success: true, data: { ...populated, planName: planName(userPlan.planKey) } })
  } catch (error) {
    console.error('Error updating user plan:', error)
    res.status(500).json({ success: false, message: 'Failed to update user plan' })
  }
}

const getUserPlanHistory = async (req, res) => {
  try {
    const userId = req.params.userId

    const history = await UserPlan.find({ userId })
      .sort({ startDate: -1 })
      .lean()

    const data = history.map((up) => ({
      ...up,
      planName: planName(up.planKey),
    }))

    res.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching user plan history:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch plan history' })
  }
}

const getMyPlan = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id
    const clientsUsed = await Vehicle.countDocuments({ userId })

    const activePlanDoc = await UserPlan.findOne({
      userId,
      status: 'active',
      ...activePlanExpiryFilter(),
    })

    if (activePlanDoc) {
      await ensureCurrentCycle(activePlanDoc)
    }

    const activePlan = activePlanDoc ? activePlanDoc.toObject() : null

    if (!activePlan) {
      const latestPlan = await UserPlan.findOne({ userId })
        .sort({ startDate: -1 })
        .lean()

      if (!latestPlan) {
        const freePlan = getPlan(FREE_PLAN_KEY)
        const newPlan = await UserPlan.create({
          userId,
          planKey: FREE_PLAN_KEY,
          startDate: new Date(),
          expiryDate: computeExpiryDate(freePlan.durationDays),
          status: 'active',
        })

        return res.json({
          success: true,
          data: {
            _id: newPlan._id,
            planKey: FREE_PLAN_KEY,
            name: freePlan.name,
            status: 'active',
            startDate: newPlan.startDate,
            expiryDate: newPlan.expiryDate,
            usage: { aiDocumentsUsed: 0, manualDocumentsUsed: 0 },
            clientsUsed,
          },
        })
      }

      return res.json({
        success: true,
        data: {
          ...latestPlan,
          name: planName(latestPlan.planKey),
          status: 'expired',
          clientsUsed,
        },
      })
    }

    res.json({
      success: true,
      data: {
        ...activePlan,
        name: planName(activePlan.planKey),
        clientsUsed,
      },
    })
  } catch (error) {
    console.error('Error fetching my plan:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch plan' })
  }
}

module.exports = {
  listUserPlans,
  assignPlan,
  updateUserPlan,
  getUserPlanHistory,
  getMyPlan,
}
