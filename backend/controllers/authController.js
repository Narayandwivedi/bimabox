const User = require('../models/User')
const Admin = require('../models/Admin')
const Otp = require('../models/Otp')
const { recordFailedAttempt } = require('../middleware/adminRateLimiter')
const bcrypt = require('bcryptjs')
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const { sendOtpEmail } = require('../utils/email')
const { assignFreePlanIfNone } = require('../utils/assignFreePlan')
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
  hasPassword: !!user.password,
  lastLogin: user.lastLogin || null,
  address: user.address || '',
  businessName: user.businessName || '',
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

    const isEmail = identifier.includes('@')
    const user = isEmail
      ? await User.findOne({ email: identifier.toLowerCase() })
      : await User.findOne({ mobile: identifier })

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

const register = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim()
    const email = String(req.body.email || '').trim().toLowerCase()
    const mobile = String(req.body.mobile || '').trim()
    const password = String(req.body.password || '')

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' })
    }

    if (password && password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' })
    }

    const userData = {
      name,
      email,
      isActive: true,
      lastLogin: new Date()
    }

    if (password) {
      userData.password = await bcrypt.hash(password, 10)
    }
    if (mobile && /^\d{10}$/.test(mobile)) {
      const mobileExists = await User.findOne({ mobile })
      if (mobileExists) {
        return res.status(409).json({ success: false, message: 'Mobile number already registered' })
      }
      userData.mobile = mobile
    }
    const user = new User(userData)
    await user.save()
    await assignFreePlanIfNone(user._id)

    const token = signToken({ userId: String(user._id), type: 'user' })
    res.setHeader('Set-Cookie', buildAuthCookie(token))

    res.status(201).json({
      success: true,
      data: { user: sanitizeUser(user) },
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ success: false, message: 'Failed to register' })
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
      await assignFreePlanIfNone(user._id)
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

const updateMobile = async (req, res) => {
  try {
    const mobile = String(req.body.mobile || '').trim()

    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Mobile number must be 10 digits' })
    }

    const existing = await User.findOne({ mobile, _id: { $ne: req.user._id } })
    if (existing) {
      return res.status(409).json({ success: false, message: 'Mobile number already registered' })
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { mobile },
      { new: true }
    )

    res.json({
      success: true,
      data: { user: sanitizeUser(updatedUser) },
    })
  } catch (error) {
    console.error('Update mobile error:', error)
    res.status(500).json({ success: false, message: 'Failed to update mobile number' })
  }
}

const updateName = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim()

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' })
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true }
    )

    res.json({
      success: true,
      data: { user: sanitizeUser(updatedUser) },
    })
  } catch (error) {
    console.error('Update name error:', error)
    res.status(500).json({ success: false, message: 'Failed to update name' })
  }
}

const updateProfile = async (req, res) => {
  try {
    const { name, mobile, address, businessName } = req.body
    const updateData = {}

    if (name !== undefined) {
      const trimmedName = String(name).trim()
      if (!trimmedName) {
        return res.status(400).json({ success: false, message: 'Name is required' })
      }
      updateData.name = trimmedName
    }

    if (mobile !== undefined) {
      const trimmedMobile = String(mobile).trim()
      if (trimmedMobile && !/^\d{10}$/.test(trimmedMobile)) {
        return res.status(400).json({ success: false, message: 'Mobile number must be 10 digits' })
      }
      if (trimmedMobile) {
        const existing = await User.findOne({ mobile: trimmedMobile, _id: { $ne: req.user._id } })
        if (existing) {
          return res.status(409).json({ success: false, message: 'Mobile number already registered' })
        }
        updateData.mobile = trimmedMobile
      } else {
        updateData.mobile = ''
      }
    }

    if (address !== undefined) {
      updateData.address = String(address).trim()
    }

    if (businessName !== undefined) {
      updateData.businessName = String(businessName).trim()
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    )

    res.json({
      success: true,
      data: { user: sanitizeUser(updatedUser) },
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ success: false, message: 'Failed to update profile' })
  }
}

const accessUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    user.lastLogin = new Date()
    await user.save()

    const token = signToken({ userId: String(user._id), type: 'user' })
    res.setHeader('Set-Cookie', buildAuthCookie(token))

    res.json({
      success: true,
      data: {
        userId: user._id,
        redirectUrl: process.env.MAIN_APP_URL || 'https://bimabox.in',
      },
    })
  } catch (error) {
    console.error('Access user error:', error)
    res.status(500).json({ success: false, message: 'Failed to access user' })
  }
}

const setPassword = async (req, res) => {
  try {
    const newPassword = String(req.body.password || '')

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }

    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    res.json({
      success: true,
      message: 'Password set successfully',
      data: { user: sanitizeUser(user) }
    })
  } catch (error) {
    console.error('Set password error:', error)
    res.status(500).json({ success: false, message: 'Failed to set password' })
  }
}

const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.json({ success: true, message: 'If this email is registered, you will receive an OTP' })
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const hashedOtp = await bcrypt.hash(otp, 10)

    await Otp.deleteMany({ email })
    await Otp.create({
      email,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    })

    console.log(`[Password Reset] OTP for ${email}: ${otp}`)

    await sendOtpEmail(email, otp)

    res.json({ success: true, message: 'OTP send at email successfully' })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ success: false, message: 'Failed to send OTP' })
  }
}

const verifyOtp = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const otp = String(req.body.otp || '').trim()

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' })
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ success: false, message: 'OTP must be 6 digits' })
    }

    const otpRecord = await Otp.findOne({ email, verified: false })

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP expired or invalid' })
    }

    const isValid = await otpRecord.compareOtp(otp)
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' })
    }

    otpRecord.verified = true
    await otpRecord.save()

    res.json({ success: true, message: 'OTP verified successfully' })
  } catch (error) {
    console.error('Verify OTP error:', error)
    res.status(500).json({ success: false, message: 'Failed to verify OTP' })
  }
}

const resetPassword = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const otp = String(req.body.otp || '').trim()
    const newPassword = String(req.body.newPassword || '')

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }

    const otpRecord = await Otp.findOne({ email, verified: true })

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP not verified or expired. Please request a new OTP.' })
    }

    const isValid = await otpRecord.compareOtp(otp)
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    await Otp.deleteMany({ email })

    res.json({ success: true, message: 'Password reset successfully. You can now login with your new password.' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ success: false, message: 'Failed to reset password' })
  }
}

module.exports = {
  login,
  register,
  profile,
  updateMobile,
  updateName,
  updateProfile,
  adminLogin,
  adminProfile,
  logout,
  adminLogout,
  changeAdminPassword,
  googleLogin,
  accessUser,
  setPassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
}
