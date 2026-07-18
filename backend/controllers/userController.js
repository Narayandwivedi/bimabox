const User = require('../models/User')
const UserPlan = require('../models/UserPlan')
const bcrypt = require('bcryptjs')
const whatsAppSessionManager = require('../services/whatsAppSessionManager')

const sanitizeUser = async (user) => {
  const base = {
    _id: user._id,
    name: user.name || '',
    mobile: user.mobile || '',
    isActive: user.isActive !== false,
    lastLogin: user.lastLogin || null,
    createdAt: user.createdAt,
  }

  try {
    const activePlan = await UserPlan.findOne({
      userId: user._id,
      status: 'active',
      expiryDate: { $gte: new Date() },
    })
      .populate('planId', 'name')
      .select('planId expiryDate')
      .lean()

    if (activePlan) {
      base.planName = activePlan.planId?.name || null
      base.planExpiry = activePlan.expiryDate || null
    } else {
      base.planName = null
      base.planExpiry = null
    }
  } catch (_err) {
    base.planName = null
    base.planExpiry = null
  }

  return base
}

const listUsers = async (_req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 }).lean()
    const sanitized = await Promise.all(users.map(sanitizeUser))
    res.json({ success: true, data: sanitized })
  } catch (error) {
    console.error('Error listing users:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch users' })
  }
}

const buildWelcomeMessage = ({ name, mobile, password }) => `${name ? `Dear ${name},` : 'Dear User,'}

Your account has been created successfully.

Login Mobile: ${mobile}
Password: ${password}

Please keep these details safe.

Thank you.`

const createUser = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim()
    const password = String(req.body.password || '')
    const mobile = String(req.body.mobile || '').trim()

    if (!name || !mobile || !password) {
      return res.status(400).json({ success: false, message: 'Name, mobile, and password are required' })
    }

    const existingUser = await User.findOne({ mobile }).lean()

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this mobile number' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      mobile,
      password: hashedPassword,
      isActive: true,
    })

    let whatsappNotice = null
    if (whatsAppSessionManager.hasClient()) {
      try {
        await whatsAppSessionManager.sendTextMessage(
          mobile,
          buildWelcomeMessage({ name, mobile, password })
        )
        whatsappNotice = 'WhatsApp message sent'
      } catch (whatsAppError) {
        console.error('Error sending user creation WhatsApp message:', whatsAppError)
        whatsappNotice = `WhatsApp message failed: ${whatsAppError.message || 'Unknown error'}`
      }
    } else {
      whatsappNotice = 'WhatsApp not connected, so message was not sent'
    }

    res.status(201).json({
      success: true,
      data: await sanitizeUser(user),
      message: whatsappNotice || 'User created successfully',
    })
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({ success: false, message: 'Failed to create user' })
  }
}

const updateUser = async (req, res) => {
  try {
    const userId = String(req.params.id || '').trim()
    const name = String(req.body.name || '').trim()
    const password = String(req.body.password || '')
    const mobile = String(req.body.mobile || '').trim()
    const isActive =
      typeof req.body.isActive === 'boolean'
        ? req.body.isActive
        : String(req.body.isActive || '').trim() === 'true'

    if (!userId || !name || !mobile) {
      return res.status(400).json({ success: false, message: 'Name and mobile are required' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const existingUser = await User.findOne({ mobile, _id: { $ne: userId } }).lean()
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Another user already exists with this mobile number' })
    }

    user.name = name
    user.mobile = mobile
    user.isActive = isActive

    if (password) {
      user.password = await bcrypt.hash(password, 10)
    }

    await user.save()

    res.json({
      success: true,
      data: await sanitizeUser(user),
    })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ success: false, message: 'Failed to update user' })
  }
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
}
