const express = require('express')
const controller = require('../controllers/calculatorController')
const configController = require('../controllers/calculatorConfigController')

const router = express.Router()

router.post('/generate-pdf', controller.generatePdf)

// Calculator Tariff & Field Configuration Routes
router.get('/config', configController.getAllConfigs)
router.get('/config/:vehicleType', configController.getConfigByVehicleType)
router.put('/config/:vehicleType', configController.upsertConfig)
router.post('/custom-field', configController.addCustomField)
router.put('/custom-field/:fieldId', configController.updateCustomField)
router.delete('/custom-field/:fieldId', configController.deleteCustomField)

module.exports = router

