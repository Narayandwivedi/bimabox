const express = require('express')
const controller = require('../controllers/userPlanController')
const { requireAdminAuth } = require('../middleware/adminAuth')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

router.get('/', requireAdminAuth, controller.listUserPlans)
router.post('/', requireAdminAuth, controller.assignPlan)
router.put('/:id', requireAdminAuth, controller.updateUserPlan)
router.get('/history/:userId', requireAdminAuth, controller.getUserPlanHistory)
router.get('/my-plan', requireAuth, controller.getMyPlan)

module.exports = router
