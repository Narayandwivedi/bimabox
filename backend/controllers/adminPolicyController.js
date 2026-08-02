const mongoose = require('mongoose')
const Insurance = require('../models/Insurance')
const User = require('../models/User')
const InsuranceCompany = require('../models/InsuranceCompany')
const ProductType = require('../models/ProductType')

const SEARCH_FIELDS = ['vehicleNumber', 'policyNumber', 'policyHolderName', 'mobileNumber', 'insuranceCompany', 'product']

const parseDateString = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null
  const parts = dateStr.trim().split(/[/-]/)
  if (parts.length !== 3) return null

  const day = Number(parts[0])
  const month = Number(parts[1]) - 1
  const year = Number(parts[2])
  if ([day, month, year].some(Number.isNaN) || year < 1900) return null

  const date = new Date(year, month, day)
  if (Number.isNaN(date.getTime())) return null
  if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) return null
  return date
}

const getFinancialYears = (records) => {
  const years = new Set()
  for (const r of records) {
    const d = parseDateString(r.issueDate)
    if (!d) continue
    const fy = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1
    years.add(fy)
  }
  return Array.from(years).sort((a, b) => b - a)
}

const buildFilteredRecords = async (req) => {
  const mongoFilter = {}
  if (req.query.userId && mongoose.Types.ObjectId.isValid(req.query.userId)) {
    mongoFilter.userId = req.query.userId
  }
  if (req.query.insuranceCompanyId && mongoose.Types.ObjectId.isValid(req.query.insuranceCompanyId)) {
    mongoFilter.insuranceCompanyId = req.query.insuranceCompanyId
  }
  if (req.query.productTypeId && mongoose.Types.ObjectId.isValid(req.query.productTypeId)) {
    mongoFilter.productTypeId = req.query.productTypeId
  }

  const rawRecords = await Insurance.find(mongoFilter)
    .populate('userId', 'name mobile email')
    .sort({ createdAt: -1 })
    .lean()

  const search = (req.query.search || '').trim().toLowerCase()
  const matchesSearch = (record) => {
    if (!search) return true
    if (SEARCH_FIELDS.some((f) => String(record[f] || '').toLowerCase().includes(search))) return true
    const owner = record.userId
    if (owner && (String(owner.name || '').toLowerCase().includes(search) || String(owner.mobile || '').toLowerCase().includes(search))) return true
    return false
  }

  const filtered = rawRecords.filter(matchesSearch).filter((record) => {
    if (req.query.financialYear) {
      const year = parseInt(req.query.financialYear, 10)
      const fyStart = new Date(year, 3, 1)
      const fyEnd = new Date(year + 1, 2, 31, 23, 59, 59, 999)
      const recordDate = parseDateString(record.issueDate)
      if (!recordDate || recordDate < fyStart || recordDate > fyEnd) return false
    }
    return true
  })

  return { filtered, rawRecords }
}

const listPolicies = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.max(Number(req.query.limit) || 20, 1)

    const { filtered, rawRecords } = await buildFilteredRecords(req)

    const totalRecords = filtered.length
    const data = filtered.slice((page - 1) * limit, page * limit)

    res.json({
      success: true,
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.max(Math.ceil(totalRecords / limit), 1),
        totalRecords,
        limit,
      },
      financialYears: getFinancialYears(rawRecords),
    })
  } catch (error) {
    console.error('Error fetching admin policy search results:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch policies' })
  }
}

const exportPolicies = async (req, res) => {
  try {
    const { filtered } = await buildFilteredRecords(req)
    res.json({
      success: true,
      data: filtered,
    })
  } catch (error) {
    console.error('Error exporting admin policy search results:', error)
    res.status(500).json({ success: false, message: 'Failed to export policies' })
  }
}

const getFilters = async (_req, res) => {
  try {
    const [users, companies, productTypes] = await Promise.all([
      User.find({}).select('name mobile').sort({ name: 1 }).lean(),
      InsuranceCompany.find({}).sort({ name: 1 }).lean(),
      ProductType.find({}).sort({ name: 1 }).lean(),
    ])

    res.json({
      success: true,
      data: { users, companies, productTypes },
    })
  } catch (error) {
    console.error('Error fetching admin policy filters:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch filters' })
  }
}

module.exports = { listPolicies, exportPolicies, getFilters }
