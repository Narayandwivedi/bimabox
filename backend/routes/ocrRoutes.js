const express = require('express')
const { rcOcr, taxOcr, fitnessOcr, pucOcr, gpsOcr, insuranceOcr } = require('../controllers/ocrController')
const { requireAuth } = require('../middleware/auth')
const { planEnforcer, incrementUsage } = require('../middleware/planEnforcer')

const router = express.Router()

router.use(requireAuth)

const aiGate = [planEnforcer('ai'), incrementUsage('ai')]

router.post('/rc', ...aiGate, rcOcr)
router.post('/tax', ...aiGate, taxOcr)
router.post('/fitness', ...aiGate, fitnessOcr)
router.post('/puc', ...aiGate, pucOcr)
router.post('/gps', ...aiGate, gpsOcr)
router.post('/insurance', ...aiGate, insuranceOcr)

module.exports = router
