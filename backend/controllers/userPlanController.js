const UserPlan = require('../models/UserPlan')
const SubscriptionPlan = require('../models/SubscriptionPlan')
const User = require('../models/User')
const Vehicle = require('../models/Vehicle')
const { ensureCurrentCycle } = require('../utils/planCycle')

const listUserPlans = async (req, res) => {
  try {
    const { search, planId, status } = req.query
    const filter = {}

    if (planId) filter.planId = planId
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
      .populate('planId', 'name price features')
      .sort({ createdAt: -1 })
      .lean()

    res.json({ success: true, data: plans })
  } catch (error) {
    console.error('Error listing user plans:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch user plans' })
  }
}

const assignPlan = async (req, res) => {
  try {
    const { userId, planId, startDate, notes } = req.body

    if (!userId || !planId) {
      return res.status(400).json({ success: false, message: 'userId and planId are required' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const plan = await SubscriptionPlan.findById(planId)
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' })
    }

    const effectiveStartDate = startDate ? new Date(startDate) : new Date()
    const expiryDate = new Date(effectiveStartDate)
    expiryDate.setDate(expiryDate.getDate() + plan.durationDays)

    await UserPlan.updateMany(
      { userId, status: 'active' },
      { $set: { status: 'expired' } }
    )

    const userPlan = await UserPlan.create({
      userId,
      planId,
      startDate: effectiveStartDate,
      expiryDate,
      status: 'active',
      assignedBy: req.adminId || req.admin?._id,
      notes: notes || '',
    })

    const populated = await UserPlan.findById(userPlan._id)
      .populate('userId', 'name mobile email isActive')
      .populate('planId', 'name price features')
      .lean()

    res.status(201).json({ success: true, data: populated })
  } catch (error) {
    console.error('Error assigning plan:', error)
    res.status(500).json({ success: false, message: 'Failed to assign plan' })
  }
}

const updateUserPlan = async (req, res) => {
  try {
    const userPlanId = req.params.id
    const { planId, expiryDate, status, notes } = req.body

    const userPlan = await UserPlan.findById(userPlanId)
    if (!userPlan) {
      return res.status(404).json({ success: false, message: 'User plan not found' })
    }

    if (planId !== undefined) {
      const plan = await SubscriptionPlan.findById(planId)
      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plan not found' })
      }
      userPlan.planId = planId

      if (!expiryDate) {
        const newExpiry = new Date(userPlan.startDate || new Date())
        newExpiry.setDate(newExpiry.getDate() + plan.durationDays)
        userPlan.expiryDate = newExpiry
      }
    }

    if (expiryDate !== undefined) userPlan.expiryDate = new Date(expiryDate)
    if (status !== undefined) userPlan.status = status
    if (notes !== undefined) userPlan.notes = notes

    await userPlan.save()

    const populated = await UserPlan.findById(userPlan._id)
      .populate('userId', 'name mobile email isActive')
      .populate('planId', 'name price features')
      .lean()

    res.json({ success: true, data: populated })
  } catch (error) {
    console.error('Error updating user plan:', error)
    res.status(500).json({ success: false, message: 'Failed to update user plan' })
  }
}

const getUserPlanHistory = async (req, res) => {
  try {
    const userId = req.params.userId

    const history = await UserPlan.find({ userId })
      .populate('planId', 'name price features')
      .sort({ startDate: -1 })
      .lean()

    res.json({ success: true, data: history })
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
      expiryDate: { $gte: new Date() },
    }).populate('planId', 'name price features durationDays')

    if (activePlanDoc) {
      await ensureCurrentCycle(activePlanDoc)
    }

    const activePlan = activePlanDoc ? activePlanDoc.toObject() : null

    if (!activePlan) {
      const latestPlan = await UserPlan.findOne({ userId })
        .populate('planId', 'name price features durationDays')
        .sort({ startDate: -1 })
        .lean()

      if (!latestPlan) {
        const defaultPlan = await SubscriptionPlan.findOne({ name: 'Free', isActive: true }).lean()
        if (!defaultPlan) {
          return res.json({ success: true, data: null })
        }

        const expiry = new Date()
        expiry.setDate(expiry.getDate() + defaultPlan.durationDays)

        const newPlan = await UserPlan.create({
          userId,
          planId: defaultPlan._id,
          startDate: new Date(),
          expiryDate: expiry,
          status: 'active',
        })

        const populated = await UserPlan.findById(newPlan._id)
          .populate('planId', 'name price features durationDays')
          .lean()

        return res.json({ success: true, data: { ...populated, clientsUsed } })
      }

      return res.json({
        success: true,
        data: { ...latestPlan, status: 'expired', clientsUsed },
      })
    }

    res.json({ success: true, data: { ...activePlan, clientsUsed } })
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
