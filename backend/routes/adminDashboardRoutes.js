const express = require('express')
const controller = require('../controllers/adminDashboardController')
const { requireAdminAuth } = require('../middleware/adminAuth')

const router = express.Router()

router.get('/stats', requireAdminAuth, controller.getStats)

module.exports = router
