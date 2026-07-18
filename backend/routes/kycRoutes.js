const express = require('express')
const controller = require('../controllers/kycController')
const { requireAuth } = require('../middleware/auth')
const { planEnforcer, incrementUsage } = require('../middleware/planEnforcer')

const router = express.Router()
router.use(requireAuth)

router.get('/', controller.getAll)
router.get('/:id', controller.getById)
router.post('/', planEnforcer('manual'), incrementUsage('manual'), controller.create)
router.put('/:id', controller.update)
router.delete('/:id', controller.remove)

module.exports = router
