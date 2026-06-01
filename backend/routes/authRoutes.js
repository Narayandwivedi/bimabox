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
router.put('/mobile', requireAuth, controller.updateMobile)
router.post('/logout', controller.logout)
router.post('/admin/login', loginRequestLimiter, checkIpBlock, controller.adminLogin)
router.get('/admin/profile', requireAdminAuth, controller.adminProfile)
router.post('/admin/logout', controller.adminLogout)
router.post('/admin/change-password', requireAdminAuth, controller.changeAdminPassword)

module.exports = router
