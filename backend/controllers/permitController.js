const Permit = require('../models/Permit')
const { createRecordController } = require('./recordControllerFactory')

module.exports = createRecordController({
  name: 'permit',
  label: 'Permit',
  Model: Permit,
  expiryField: 'validTo',
  requiredDateField: 'validFrom',
  expiringDays: 30,
  searchFields: ['vehicleNumber', 'name'],
  stringFields: ['vehicleNumber', 'name', 'validFrom', 'validTo', 'permitDocument'],
  uppercaseFields: ['vehicleNumber'],
  numberFields: [],
  documentField: 'permitDocument',
  documentDataField: 'permitDocumentData'
})
