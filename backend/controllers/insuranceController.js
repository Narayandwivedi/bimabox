const Insurance = require('../models/Insurance')
const { createRecordController, getFinancialYears } = require('./recordControllerFactory')

const base = createRecordController({
  name: 'insurance',
  label: 'Insurance',
  Model: Insurance,
  expiryField: 'validTo',
  requiredDateField: 'validFrom',
  expiringDays: 30,
  searchFields: ['vehicleNumber', 'policyNumber', 'policyHolderName', 'mobileNumber', 'reference', 'imd'],
  stringFields: ['vehicleNumber', 'policyNumber', 'policyHolderName', 'mobileNumber', 'insuranceCompany', 'insuranceClass', 'product', 'vehicleClass', 'validFrom', 'validTo', 'tpValidFrom', 'tpValidTo', 'issueDate', 'insuranceDocument', 'endorsementDocument', 'remarks', 'reference', 'imd', 'renewalStatus', 'claimDate', 'claimRemarks'],
  objectIdFields: ['insuranceCompanyId'],
  uppercaseFields: ['vehicleNumber', 'policyNumber'],
  numberFields: ['premium', 'odPremium', 'tpPremium', 'netPremium'],
  booleanFields: ['claimRaised'],
  documentField: 'insuranceDocument',
  documentDataField: 'insuranceDocumentData',
  arrayStringFields: ['endorsementDocuments'],
})

/**
 * Parse a DD-MM-YYYY date string and return days left from today.
 * Returns null if the date is missing or unparseable.
 */
const getDaysLeft = (dateStr) => {
  if (!dateStr || dateStr === 'N/A' || dateStr === 'None') return null
  const parts = dateStr.trim().split(/[/-]/)
  if (parts.length !== 3) return null
  // Always DD-MM-YYYY
  const day = Number(parts[0])
  const month = Number(parts[1]) - 1
  const year = Number(parts[2])
  if ([day, month + 1, year].some(isNaN) || year < 1900) return null
  const expiry = new Date(year, month, day)
  if (isNaN(expiry.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  expiry.setHours(0, 0, 0, 0)
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * GET /api/insurance/renewals
 * Returns only the records relevant for the renewals view:
 *   - Pending: expiring within next 90 days OR expired within last 60 days
 *   - Renewed / Lost: all (regardless of expiry date)
 * Sorted by daysLeft ascending (most urgent first).
 */
const getRenewalsList = async (req, res) => {
  try {
    const MAX_EXPIRED_DAYS = 60   // how far past expiry to still show
    const MAX_UPCOMING_DAYS = 90  // widest upcoming filter shown in UI

    const all = await Insurance.find({ userId: req.user._id })
      .lean()
      .select('policyHolderName vehicleNumber policyNumber insuranceCompany insuranceCompanyId product insuranceClass validFrom validTo renewalStatus renewalStatusChangedAt premium odPremium tpPremium netPremium claimRaised claimDate claimRemarks')

    const result = all
      .map((r) => ({ ...r, daysLeft: getDaysLeft(r.validTo) }))
      .filter((r) => {
        const status = r.renewalStatus || 'pending'
        // Always include renewed / lost so their tabs are populated
        if (status === 'renewed' || status === 'lost' || status === 'opportunity') return true
        // Pending: only if daysLeft is calculable and within range
        if (r.daysLeft === null) return false
        return r.daysLeft >= -MAX_EXPIRED_DAYS && r.daysLeft <= MAX_UPCOMING_DAYS
      })
      .sort((a, b) => (a.daysLeft ?? 9999) - (b.daysLeft ?? 9999))
      .filter((r) => {
        if (!req.query.financialYear) return true
        const year = parseInt(req.query.financialYear, 10)
        if (!r.issueDate) return false
        const parts = r.issueDate.split('-')
        if (parts.length !== 3) return false
        const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]))
        const fyStart = new Date(year, 3, 1)
        const fyEnd = new Date(year + 1, 2, 31, 23, 59, 59, 999)
        return d >= fyStart && d <= fyEnd
      })

    res.json({ success: true, data: result, financialYears: getFinancialYears(all) })
  } catch (error) {
    console.error('Error fetching renewals list:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch renewals list' })
  }
}

const updateRenewalStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!['pending', 'renewed', 'lost', 'opportunity'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be pending, renewed, lost, or opportunity' })
    }

    const record = await Insurance.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { renewalStatus: status, renewalStatusChangedAt: new Date() },
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

module.exports = { ...base, updateRenewalStatus, getRenewalsList }
