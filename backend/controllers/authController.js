const User = require('../models/User')
const Admin = require('../models/Admin')
const { recordFailedAttempt } = require('../middleware/adminRateLimiter')
const bcrypt = require('bcryptjs')
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const {
  signToken,
  buildAuthCookie,
  buildAdminAuthCookie,
  buildClearAuthCookie,
  buildClearAdminAuthCookie,
} = require('../utils/authToken')

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name || '',
  email: user.email || '',
  mobile: user.mobile || '',
  picture: user.picture || '',
  isActive: user.isActive !== false,
  lastLogin: user.lastLogin || null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

const sanitizeAdmin = (admin) => ({
  _id: admin._id,
  email: admin.email || '',
  lastLogin: admin.lastLogin || null,
  createdAt: admin.createdAt,
  updatedAt: admin.updatedAt,
})

const login = async (req, res) => {
  try {
    const identifier = String(req.body.identifier || '').trim()
    const password = String(req.body.password || '')

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Identifier and password are required' })
    }

    const user = await User.findOne({ mobile: identifier })

    if (!user || user.isActive === false) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const isValidPassword = await user.comparePassword(password)
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    user.lastLogin = new Date()
    await user.save()

    const token = signToken({ userId: String(user._id), type: 'user' })
    res.setHeader('Set-Cookie', buildAuthCookie(token))

    res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: 'Failed to login' })
  }
}

const profile = async (req, res) => {
  res.json({
    success: true,
    data: {
      user: sanitizeUser(req.user),
    },
  })
}

const adminLogin = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    const admin = await Admin.findOne({ email })
    if (!admin) {
      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
      recordFailedAttempt(ip)
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const isValidPassword = await admin.comparePassword(password)
    if (!isValidPassword) {
      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
      recordFailedAttempt(ip)
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    admin.lastLogin = new Date()
    await admin.save()

    const token = signToken({ adminId: String(admin._id), type: 'admin' })
    res.setHeader('Set-Cookie', buildAdminAuthCookie(token))

    res.json({
      success: true,
      data: {
        admin: sanitizeAdmin(admin),
      },
    })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({ success: false, message: 'Failed to login' })
  }
}

const adminProfile = async (req, res) => {
  res.json({
    success: true,
    data: {
      admin: sanitizeAdmin(req.admin),
    },
  })
}

const logout = async (_req, res) => {
  res.setHeader('Set-Cookie', buildClearAuthCookie())
  res.json({ success: true, message: 'Logged out successfully' })
}

const adminLogout = async (_req, res) => {
  res.setHeader('Set-Cookie', buildClearAdminAuthCookie())
  res.json({ success: true, message: 'Logged out successfully' })
}

const changeAdminPassword = async (req, res) => {
  try {
    const currentPassword = String(req.body.currentPassword || '')
    const newPassword = String(req.body.newPassword || '')

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' })
    }

    const admin = await Admin.findById(req.admin._id)
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' })
    }

    const isValidPassword = await admin.comparePassword(currentPassword)
    if (!isValidPassword) {
      return res.status(400).json({ success: false, message: 'Invalid current password' })
    }

    admin.password = await bcrypt.hash(newPassword, 10)
    await admin.save()

    res.json({ success: true, message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change admin password error:', error)
    res.status(500).json({ success: false, message: 'Failed to change password' })
  }
}

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required' })
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()
    const { sub: googleId, email, name, picture } = payload

    // Find or create user
    let user = await User.findOne({ $or: [{ googleId }, { email }] })

    if (user) {
      // Update googleId if not present (case where email matched)
      if (!user.googleId) {
        user.googleId = googleId
      }
      user.lastLogin = new Date()
      await user.save()
    } else {
      // Create new user
      user = new User({
        name,
        email,
        googleId,
        picture,
        isActive: true,
        lastLogin: new Date()
      })
      await user.save()
    }

    const token = signToken({ userId: String(user._id), type: 'user' })
    res.setHeader('Set-Cookie', buildAuthCookie(token))

    res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
      },
    })
  } catch (error) {
    console.error('Google login error:', error)
    res.status(500).json({ success: false, message: 'Google authentication failed' })
  }
}

module.exports = {
  login,
  profile,
  adminLogin,
  adminProfile,
  logout,
  adminLogout,
  changeAdminPassword,
  googleLogin,
}
