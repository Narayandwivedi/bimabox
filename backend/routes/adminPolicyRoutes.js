const express = require('express')
const controller = require('../controllers/adminPolicyController')
const { requireAdminAuth } = require('../middleware/adminAuth')

const router = express.Router()

router.get('/filters', requireAdminAuth, controller.getFilters)
router.get('/export', requireAdminAuth, controller.exportPolicies)
router.get('/', requireAdminAuth, controller.listPolicies)

module.exports = router
