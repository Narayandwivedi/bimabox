const express = require('express')
const controller = require('../controllers/taxController')
const { requireAuth } = require('../middleware/auth')
const { planEnforcer, incrementUsage } = require('../middleware/planEnforcer')

const router = express.Router()

router.use(requireAuth)

router.get('/statistics', controller.getStatistics)
router.get('/expiring-soon', controller.getExpiringSoon)
router.get('/expired', controller.getExpired)
router.get('/', controller.getAll)
router.get('/:id', controller.getById)
router.post('/', planEnforcer('manual'), incrementUsage('manual'), controller.create)
router.put('/:id', controller.update)
router.delete('/:id', controller.remove)
router.patch('/:id/mark-as-paid', controller.markAsPaid)
router.patch('/:id/whatsapp-increment', controller.incrementWhatsapp)

module.exports = router
