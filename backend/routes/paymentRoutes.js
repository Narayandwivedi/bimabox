const express = require('express')
const paymentController = require('../controllers/paymentController')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

router.post('/create-order', requireAuth, paymentController.createOrder)
router.post('/verify-payment', requireAuth, paymentController.verifyPayment)

module.exports = router
