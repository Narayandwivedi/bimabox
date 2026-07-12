const express = require('express')
const controller = require('../controllers/authController')
const { requireAuth } = require('../middleware/auth')
const { requireAdminAuth } = require('../middleware/adminAuth')

const { loginRequestLimiter, checkIpBlock } = require('../middleware/adminRateLimiter')

const router = express.Router()

router.post('/register', controller.register)
router.post('/login', controller.login)
router.post('/google', controller.googleLogin)
router.get('/profile', requireAuth, controller.profile)
router.put('/profile', requireAuth, controller.updateProfile)
router.put('/mobile', requireAuth, controller.updateMobile)
router.put('/name', requireAuth, controller.updateName)
router.post('/set-password', requireAuth, controller.setPassword)
router.post('/logout', controller.logout)
router.post('/admin/login', controller.adminLogin)
router.get('/admin/profile', requireAdminAuth, controller.adminProfile)
router.post('/admin/logout', controller.adminLogout)
router.post('/admin/access-user/:id', requireAdminAuth, controller.accessUser)
router.post('/admin/change-password', requireAdminAuth, controller.changeAdminPassword)
router.post('/forgot-password', controller.forgotPassword)
router.post('/verify-otp', controller.verifyOtp)
router.post('/reset-password', controller.resetPassword)

module.exports = router
