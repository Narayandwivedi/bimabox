const Insurance = require('../models/Insurance')
const { createRecordController } = require('./recordControllerFactory')

module.exports = createRecordController({
  name: 'insurance',
  label: 'Insurance',
  Model: Insurance,
  expiryField: 'validTo',
  requiredDateField: 'validFrom',
  expiringDays: 30,
  searchFields: ['vehicleNumber', 'policyNumber', 'policyHolderName', 'mobileNumber', 'reference'],
  stringFields: ['vehicleNumber', 'policyNumber', 'policyHolderName', 'mobileNumber', 'insuranceCompany', 'insuranceClass', 'product', 'vehicleClass', 'validFrom', 'validTo', 'issueDate', 'insuranceDocument', 'remarks', 'reference'],
  uppercaseFields: ['vehicleNumber', 'policyNumber'],
  numberFields: ['premium'],
  documentField: 'insuranceDocument',
  documentDataField: 'insuranceDocumentData',
})
