const Tax = require('../models/Tax')
const { createRecordController } = require('./recordControllerFactory')

module.exports = createRecordController({
  name: 'tax',
  label: 'Tax',
  Model: Tax,
  expiryField: 'taxTo',
  requiredDateField: 'taxFrom',
  expiringDays: 15,
  searchFields: ['vehicleNumber', 'ownerName', 'mobileNumber'],
  stringFields: ['vehicleNumber', 'ownerName', 'mobileNumber', 'taxFrom', 'taxTo', 'taxDocument'],
  uppercaseFields: ['vehicleNumber'],
  numberFields: ['taxAmount', 'totalAmount', 'paidAmount', 'balanceAmount'],
  documentField: 'taxDocument',
  documentDataField: 'taxDocumentData',
  totalField: 'totalAmount',
  paidField: 'paidAmount',
  balanceField: 'balanceAmount',
})
