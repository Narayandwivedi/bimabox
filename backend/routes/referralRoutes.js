const express = require('express')
const controller = require('../controllers/referralController')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

router.get('/info', requireAuth, controller.getReferralInfo)
router.get('/list', requireAuth, controller.getReferrals)

module.exports = router
