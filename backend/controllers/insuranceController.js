const Insurance = require('../models/Insurance')
const { createRecordController } = require('./recordControllerFactory')

const base = createRecordController({
  name: 'insurance',
  label: 'Insurance',
  Model: Insurance,
  expiryField: 'validTo',
  requiredDateField: 'validFrom',
  expiringDays: 30,
  searchFields: ['vehicleNumber', 'policyNumber', 'policyHolderName', 'mobileNumber', 'reference', 'imd'],
  stringFields: ['vehicleNumber', 'policyNumber', 'policyHolderName', 'mobileNumber', 'insuranceCompany', 'insuranceClass', 'product', 'vehicleClass', 'validFrom', 'validTo', 'issueDate', 'insuranceDocument', 'endorsementDocument', 'remarks', 'reference', 'imd', 'renewalStatus'],
  uppercaseFields: ['vehicleNumber', 'policyNumber'],
  numberFields: ['premium'],
  documentField: 'insuranceDocument',
  documentDataField: 'insuranceDocumentData',
})

const updateRenewalStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!['pending', 'renewed', 'lost'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be pending, renewed, or lost' })
    }

    const record = await Insurance.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { renewalStatus: status },
      { returnDocument: 'after', runValidators: true }
    ).lean()

    if (!record) {
      return res.status(404).json({ success: false, message: 'Insurance record not found' })
    }

    res.json({ success: true, data: record })
  } catch (error) {
    console.error('Error updating renewal status:', error)
    res.status(500).json({ success: false, message: 'Failed to update renewal status' })
  }
}

module.exports = { ...base, updateRenewalStatus }
