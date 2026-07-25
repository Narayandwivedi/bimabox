const express = require('express')
const controller = require('../controllers/referralController')
const { requireAuth } = require('../middleware/auth')
const { requireAdminAuth } = require('../middleware/adminAuth')

const router = express.Router()

router.get('/info', requireAuth, controller.getReferralInfo)
router.get('/list', requireAuth, controller.getReferrals)
router.get('/admin/all', requireAdminAuth, controller.listAllReferrals)

module.exports = router
