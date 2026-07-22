const express = require('express')
const controller = require('../controllers/walletController')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

router.get('/balance', requireAuth, controller.getWalletBalance)
router.get('/transactions', requireAuth, controller.getWalletTransactions)

module.exports = router
