const express = require('express')
const controller = require('../controllers/calculatorController')

const router = express.Router()

router.post('/generate-pdf', controller.generatePdf)

module.exports = router
