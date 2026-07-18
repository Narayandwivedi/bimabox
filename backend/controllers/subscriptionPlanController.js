const SubscriptionPlan = require('../models/SubscriptionPlan')

const listPlans = async (_req, res) => {
  try {
    const plans = await SubscriptionPlan.find({}).sort({ sortOrder: 1, name: 1 }).lean()
    res.json({ success: true, data: plans })
  } catch (error) {
    console.error('Error listing subscription plans:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch plans' })
  }
}

const createPlan = async (req, res) => {
  try {
    const { name, price, durationDays, features, sortOrder } = req.body

    if (!name || price === undefined || !durationDays) {
      return res.status(400).json({ success: false, message: 'Name, price, and durationDays are required' })
    }

    const existing = await SubscriptionPlan.findOne({ name: name.trim() }).lean()
    if (existing) {
      return res.status(400).json({ success: false, message: 'A plan with this name already exists' })
    }

    const plan = await SubscriptionPlan.create({
      name: name.trim(),
      price,
      durationDays,
      sortOrder: sortOrder || 0,
      features: features || {},
    })

    res.status(201).json({ success: true, data: plan })
  } catch (error) {
    console.error('Error creating subscription plan:', error)
    res.status(500).json({ success: false, message: 'Failed to create plan' })
  }
}

const updatePlan = async (req, res) => {
  try {
    const planId = req.params.id
    const { name, price, durationDays, isActive, sortOrder, features } = req.body

    const plan = await SubscriptionPlan.findById(planId)
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' })
    }

    if (name !== undefined) plan.name = name.trim()
    if (price !== undefined) plan.price = price
    if (durationDays !== undefined) plan.durationDays = durationDays
    if (isActive !== undefined) plan.isActive = isActive
    if (sortOrder !== undefined) plan.sortOrder = sortOrder
    if (features !== undefined) {
      Object.keys(features).forEach((key) => {
        if (features[key] !== undefined) {
          plan.features[key] = features[key]
        }
      })
    }

    await plan.save()

    res.json({ success: true, data: plan })
  } catch (error) {
    console.error('Error updating subscription plan:', error)
    res.status(500).json({ success: false, message: 'Failed to update plan' })
  }
}

const deletePlan = async (req, res) => {
  try {
    const planId = req.params.id
    const plan = await SubscriptionPlan.findById(planId)

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' })
    }

    plan.isActive = false
    await plan.save()

    res.json({ success: true, message: 'Plan deactivated successfully' })
  } catch (error) {
    console.error('Error deleting subscription plan:', error)
    res.status(500).json({ success: false, message: 'Failed to delete plan' })
  }
}

module.exports = {
  listPlans,
  createPlan,
  updatePlan,
  deletePlan,
}
