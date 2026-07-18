const express = require('express')
const controller = require('../controllers/subscriptionPlanController')
const { requireAdminAuth } = require('../middleware/adminAuth')

const router = express.Router()

router.get('/', controller.listPlans)
router.post('/', requireAdminAuth, controller.createPlan)
router.put('/:id', requireAdminAuth, controller.updatePlan)
router.delete('/:id', requireAdminAuth, controller.deletePlan)

module.exports = router
