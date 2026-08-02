const crypto = require('crypto')
const Razorpay = require('razorpay')
const PaymentOrder = require('../models/PaymentOrder')
const UserPlan = require('../models/UserPlan')
const User = require('../models/User')
const { getPlan } = require('../utils/planConfig')
const { computeExpiryDate } = require('../utils/planCycle')

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET

  if (!key_id || !key_secret) {
    throw new Error('Razorpay credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are not configured.')
  }

  return new Razorpay({ key_id, key_secret })
}

/**
 * STEP 1: Create Razorpay Order
 * POST /api/payment/create-order or POST /api/create-order
 */
const createOrder = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const { planKey, amount: customAmount } = req.body
    let amountInPaise = 0
    let plan = null

    if (planKey) {
      plan = getPlan(planKey)
      if (!plan) {
        return res.status(404).json({ success: false, message: 'Subscription plan not found' })
      }

      // Convert INR price to Paise (1 INR = 100 paise)
      amountInPaise = Math.round((plan.price || 0) * 100)
    } else if (customAmount !== undefined && customAmount !== null) {
      amountInPaise = Math.round(Number(customAmount))
    }

    // Minimum amount validation: 100 paise (1 INR)
    if (!amountInPaise || amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Minimum amount must be at least 100 paise (₹1).',
      })
    }

    const razorpay = getRazorpayInstance()
    const receipt = `rcpt_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`

    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        userId: userId.toString(),
        planKey: planKey || '',
        planName: plan ? plan.name : 'Custom Payment',
      },
    }

    const order = await razorpay.orders.create(orderOptions)

    // Save PaymentOrder record in database
    await PaymentOrder.create({
      userId,
      planKey: planKey || null,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: 'created',
      notes: orderOptions.notes,
    })

    return res.status(201).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
      receipt: order.receipt,
    })
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create Razorpay order',
    })
  }
}

/**
 * STEP 3: Verify Payment Signature & Activate Plan
 * POST /api/payment/verify-payment or POST /api/verify-payment
 */
const verifyPayment = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planKey } = req.body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification fields (razorpay_order_id, razorpay_payment_id, razorpay_signature)',
      })
    }

    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      return res.status(500).json({ success: false, message: 'Server configuration error: RAZORPAY_KEY_SECRET missing' })
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')

    const isSignatureValid = expectedSignature === razorpay_signature

    if (!isSignatureValid) {
      // Record payment failure in database if order exists
      await PaymentOrder.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: 'failed', paymentId: razorpay_payment_id, signature: razorpay_signature }
      )

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Signature mismatch',
      })
    }

    // Signature verified! Update payment order in database
    const paymentOrderDoc = await PaymentOrder.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { status: 'paid', paymentId: razorpay_payment_id, signature: razorpay_signature },
      { new: true }
    )

    // Activate Subscription Plan for User if planKey provided
    const targetPlanKey = planKey || paymentOrderDoc?.planKey
    let userPlan = null

    if (targetPlanKey) {
      const plan = getPlan(targetPlanKey)
      if (plan) {
        const startDate = new Date()
        const expiryDate = computeExpiryDate(plan.durationDays, startDate)

        // Expire any existing active plans for this user
        await UserPlan.updateMany(
          { userId, status: 'active' },
          { $set: { status: 'expired' } }
        )

        userPlan = await UserPlan.create({
          userId,
          planKey: targetPlanKey,
          startDate,
          expiryDate,
          status: 'active',
          assignedBy: userId,
          notes: `Purchased online via Razorpay (Payment ID: ${razorpay_payment_id})`,
        })

        await UserPlan.findById(userPlan._id).lean()
      }
    }

    return res.json({
      success: true,
      message: 'Payment verified successfully and plan activated!',
      data: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        userPlan,
      },
    })
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed due to internal error',
    })
  }
}

module.exports = {
  createOrder,
  verifyPayment,
}
