const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const expiryReminderService = require('../services/expiryReminderService')

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

const calculateStatus = (record, expiryField, expiringDays) => {
  const expiryDate = parseDateString(record[expiryField])
  if (!expiryDate) return 'unknown'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  expiryDate.setHours(0, 0, 0, 0)

  const diffMs = expiryDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'expired'
  if (diffDays <= expiringDays) return 'expiring_soon'
  return 'active'
}

const getDaysToExpiry = (record, expiryField) => {
  const expiryDate = parseDateString(record[expiryField])
  if (!expiryDate) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  expiryDate.setHours(0, 0, 0, 0)

  const diffMs = expiryDate.getTime() - today.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

const buildSearchMatcher = (searchFields, search) => {
  if (!search || !search.trim()) return () => true
  const normalized = search.trim().toLowerCase()
  return (record) => searchFields.some((field) => String(record[field] || '').toLowerCase().includes(normalized))
}

const normalizeNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const generateDocumentName = (label, vehicleNumber) => {
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yy = String(now.getFullYear()).slice(-2)
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const vehicle = (vehicleNumber || 'UNKNOWN').toString().trim().toUpperCase()
  return `${label}_${vehicle}_${dd}-${mm}-${yy}_${hh}:${min}`
}

const getFinancialYearsByField = (records, dateField) => {
  const years = new Set()
  for (const r of records) {
    const value = r[dateField]
    if (!value) continue
    const d = parseDateString(value)
    if (!d) continue
    // Indian financial year: Apr-Mar → year starts in April
    const fy = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1
    years.add(fy)
  }
  return Array.from(years).sort((a, b) => b - a)
}

const getFinancialYears = (records) => getFinancialYearsByField(records, 'issueDate')

const buildPayload = (body, config, userId, isCreate = false) => {
  const payload = {}

  config.stringFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      const value = body[field]
      payload[field] = typeof value === 'string' ? value.trim() : value
    }
  })

  config.uppercaseFields.forEach((field) => {
    if (payload[field]) {
      payload[field] = String(payload[field]).trim().toUpperCase()
    }
  })

  config.numberFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      payload[field] = normalizeNumber(body[field], 0)
    }
  })

  if (config.booleanFields) {
    config.booleanFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        payload[field] = Boolean(body[field])
      }
    })
  }

  if (config.arrayField && Array.isArray(body[config.arrayField])) {
    payload[config.arrayField] = body[config.arrayField]
      .map((item) => ({
        name: String(item?.name || '').trim(),
        amount: normalizeNumber(item?.amount, 0),
      }))
      .filter((item) => item.name)
  }

  if (config.objectIdFields) {
    config.objectIdFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        const value = body[field]
        payload[field] = value && mongoose.Types.ObjectId.isValid(value) ? value : null
      }
    })
  }

  if (config.arrayStringFields) {
    config.arrayStringFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(body, field) && Array.isArray(body[field])) {
        payload[field] = body[field]
          .map((val) => typeof val === 'string' ? val.trim() : '')
          .filter(Boolean)
      }
    })
  }

  if (config.documentField && body[config.documentDataField]) {
    payload[config.documentField] = body[config.documentDataField]
  } else if (config.documentField && Object.prototype.hasOwnProperty.call(body, config.documentField)) {
    payload[config.documentField] = body[config.documentField]
  }

  if (isCreate) {
    payload.userId = userId
  }

  return payload
}

const processDocumentData = async (payload, config, docName) => {
  if (payload[config.documentField] && payload[config.documentField].startsWith('data:')) {
    const dataStr = payload[config.documentField]
    const matches = dataStr.match(/^data:([^;]+);base64,(.+)$/)

    if (matches && matches.length === 3) {
      const mimeType = matches[1]
      const base64Data = matches[2]

      let ext = 'pdf'
      if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg'
      else if (mimeType.includes('png')) ext = 'png'
      else if (mimeType.includes('pdf')) ext = 'pdf'

      const fileName = `${docName || Date.now()}.${ext}`
      const uploadDir = path.join(__dirname, '..', 'uploads', 'rto_docs')

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      const filePath = path.join(uploadDir, fileName)
      fs.writeFileSync(filePath, base64Data, 'base64')

      // Store the relative path to be served statically
      payload[config.documentField] = `/uploads/rto_docs/${fileName}`
    }
  }
}

const createRecordController = (config) => {
  const {
    Model,
    expiryField,
    expiringDays,
    searchFields,
    balanceField,
    paidField,
    // fyDateField: the date field used for Indian FY bucketing in the renewals view.
    // Insurance uses 'issueDate'; other types use their start date (validFrom, taxFrom, etc.)
    fyDateField,
  } = config

  const Reference = require('../models/Reference')
  const IMD = require('../models/IMD')
  const ProductType = require('../models/ProductType')

  const enrichPayloadWithIds = async (payload, userId) => {
    if (payload.reference && !payload.referenceId) {
      const escaped = payload.reference.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const match = await Reference.findOne({
        userId,
        name: { $regex: new RegExp(`^${escaped}$`, 'i') }
      }).lean()
      if (match) {
        payload.referenceId = match._id
      }
    } else if (payload.referenceId && !payload.reference) {
      const match = await Reference.findOne({ userId, _id: payload.referenceId }).lean()
      if (match) {
        payload.reference = match.name
      }
    }

    if (payload.imd && !payload.imdId) {
      const escaped = payload.imd.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const match = await IMD.findOne({
        userId,
        name: { $regex: new RegExp(`^${escaped}$`, 'i') }
      }).lean()
      if (match) {
        payload.imdId = match._id
      }
    } else if (payload.imdId && !payload.imd) {
      const match = await IMD.findOne({ userId, _id: payload.imdId }).lean()
      if (match) {
        payload.imd = match.name
      }
    }

    if (payload.product && !payload.productTypeId) {
      const escaped = payload.product.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const match = await ProductType.findOne({
        name: { $regex: new RegExp(`^${escaped}$`, 'i') }
      }).lean()
      if (match) {
        payload.productTypeId = match._id
      }
    } else if (payload.productTypeId && !payload.product) {
      const match = await ProductType.findById(payload.productTypeId).lean()
      if (match) {
        payload.product = match.name
      }
    }
  }

const listRecords = async (req, res, filterType = 'all') => {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1)
      const requestedLimit = Number(req.query.limit) || 20
      const matcher = buildSearchMatcher(searchFields, req.query.search || '')

      const targetReference = req.query.referenceId ? await Reference.findOne({ _id: req.query.referenceId, userId: req.user._id }).lean() : null
      const targetImd = req.query.imdId ? await IMD.findOne({ _id: req.query.imdId, userId: req.user._id }).lean() : null
      const targetProductType = req.query.productTypeId
        ? await ProductType.findById(req.query.productTypeId).lean()
        : (req.query.product
            ? await ProductType.findOne({ name: { $regex: new RegExp(`^${req.query.product.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }).lean()
            : null)

      const rawRecords = await Model.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean()

      const enriched = rawRecords
        .map((record) => ({
          ...record,
          status: calculateStatus(record, expiryField, expiringDays),
        }))
        .filter(matcher)
        .filter((record) => {
          if (filterType === 'expiring_soon') return record.status === 'expiring_soon'
          if (filterType === 'expired') return record.status === 'expired'
          if (filterType === 'pending') return normalizeNumber(record[balanceField], 0) > 0
          return true
        })
        .filter((record) => {
          if (req.query.insuranceCompanyId && String(record.insuranceCompanyId || '') !== req.query.insuranceCompanyId) {
            return false
          }
          if (req.query.productTypeId || req.query.product) {
            const queryId = req.query.productTypeId || (targetProductType ? targetProductType._id.toString() : null)
            const queryName = req.query.product || (targetProductType ? targetProductType.name : null)

            const matchesId = queryId && record.productTypeId?.toString() === queryId
            const matchesName = queryName && record.product && record.product.trim().toLowerCase() === queryName.trim().toLowerCase()

            if (!matchesId && !matchesName) return false
          }
          if (req.query.insuranceClass && record.insuranceClass !== req.query.insuranceClass) {
            return false
          }
          if (req.query.referenceId) {
            const matchesId = record.referenceId?.toString() === req.query.referenceId
            const matchesName = targetReference && record.reference && record.reference.trim().toLowerCase() === targetReference.name.trim().toLowerCase()
            if (!matchesId && !matchesName) return false
          }
          if (req.query.imdId) {
            const matchesId = record.imdId?.toString() === req.query.imdId
            const matchesName = targetImd && record.imd && record.imd.trim().toLowerCase() === targetImd.name.trim().toLowerCase()
            if (!matchesId && !matchesName) return false
          }
          if (req.query.claimStatus === 'raised' && !record.claimRaised) {
            return false
          }
          if (req.query.claimStatus === 'not_raised' && record.claimRaised) {
            return false
          }
          if (req.query.validity) {
            const days = getDaysToExpiry(record, expiryField)
            if (req.query.validity === 'expired') {
              if (days === null || days >= 0) return false
            } else {
              const limitDays = parseInt(req.query.validity, 10)
              if (days === null || days < 0 || days > limitDays) return false
            }
          }
          if (req.query.dateFrom) {
            const parts = req.query.dateFrom.split('-')
            if (parts.length === 3) {
              const fromDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
              const recordDate = parseDateString(record.issueDate)
              if (recordDate && recordDate < fromDate) return false
            }
          }
          if (req.query.dateTo) {
            const parts = req.query.dateTo.split('-')
            if (parts.length === 3) {
              const toDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
              toDate.setHours(23, 59, 59, 999)
              const recordDate = parseDateString(record.issueDate)
              if (recordDate && recordDate > toDate) return false
            }
          }
          if (req.query.financialYear) {
            const year = parseInt(req.query.financialYear, 10)
            const fyStart = new Date(year, 3, 1)
            const fyEnd = new Date(year + 1, 2, 31, 23, 59, 59, 999)
            const recordDate = parseDateString(record.issueDate)
            if (recordDate && (recordDate < fyStart || recordDate > fyEnd)) return false
          }
          return true
        })

      const totalRecords = enriched.length
      const limit = req.query.all === 'true' || requestedLimit <= 0
        ? Math.max(totalRecords, 1)
        : Math.max(requestedLimit, 1)
      const data = enriched.slice((page - 1) * limit, page * limit)

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
      console.error(`Error fetching ${config.name} records:`, error)
      res.status(500).json({ success: false, message: `Failed to fetch ${config.label} records` })
    }
  }

  const getAll = async (req, res) => listRecords(req, res, 'all')
  const getExpiringSoon = async (req, res) => listRecords(req, res, 'expiring_soon')
  const getExpired = async (req, res) => listRecords(req, res, 'expired')
  const getPendingPayment = async (req, res) => listRecords(req, res, 'pending')

  const getStatistics = async (req, res) => {
    try {
      const records = await Model.find({ userId: req.user._id }).lean()
      const totals = records.reduce((acc, record) => {
        const status = calculateStatus(record, expiryField, expiringDays)
        const balance = normalizeNumber(record[balanceField], 0)
        acc.total += 1
        if (status === 'active') acc.active += 1
        if (status === 'expiring_soon') acc.expiringSoon += 1
        if (status === 'expired') acc.expired += 1
        if (balance > 0) {
          acc.pendingPaymentCount += 1
          acc.pendingPaymentAmount += balance
        }
        return acc
      }, {
        total: 0,
        active: 0,
        expiringSoon: 0,
        expired: 0,
        pendingPaymentCount: 0,
        pendingPaymentAmount: 0,
      })

      res.json({ success: true, data: totals })
    } catch (error) {
      console.error(`Error fetching ${config.name} statistics:`, error)
      res.status(500).json({ success: false, message: `Failed to fetch ${config.label} statistics` })
    }
  }

  const create = async (req, res) => {
    try {
      const payload = buildPayload(req.body, config, req.user._id, true)
      await enrichPayloadWithIds(payload, req.user._id)
      if (!payload[config.requiredDateField]) {
        return res.status(400).json({ success: false, message: `${config.requiredDateField} is required` })
      }

      if (!Object.prototype.hasOwnProperty.call(payload, balanceField) && Object.prototype.hasOwnProperty.call(payload, paidField)) {
        payload[balanceField] = Math.max(normalizeNumber(payload.totalFee || payload.totalAmount, 0) - normalizeNumber(payload[paidField], 0), 0)
      }

      const vehicleNo = payload.vehicleNumber || ''
      const docName = generateDocumentName(config.label, vehicleNo)
      await processDocumentData(payload, config, docName)

      const record = await Model.create(payload)
      expiryReminderService.runOnce().catch((error) => {
        console.error(`Post-create ${config.name} reminder run failed:`, error.message)
      })
      res.status(201).json({ success: true, data: record })
    } catch (error) {
      console.error(`Error creating ${config.name} record:`, error)
      res.status(500).json({ success: false, message: `Failed to create ${config.label} record` })
    }
  }

  const update = async (req, res) => {
    try {
      const payload = buildPayload(req.body, config, req.user._id, false)
      await enrichPayloadWithIds(payload, req.user._id)
      const vehicleNo = payload.vehicleNumber || ''
      const docName = generateDocumentName(config.label, vehicleNo)
      await processDocumentData(payload, config, docName)
      const record = await Model.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, payload, {
        returnDocument: 'after',
        runValidators: true,
      }).lean()

      if (!record) {
        return res.status(404).json({ success: false, message: `${config.label} record not found` })
      }

      expiryReminderService.runOnce().catch((error) => {
        console.error(`Post-update ${config.name} reminder run failed:`, error.message)
      })
      res.json({ success: true, data: record })
    } catch (error) {
      console.error(`Error updating ${config.name} record:`, error)
      res.status(500).json({ success: false, message: `Failed to update ${config.label} record` })
    }
  }

  const remove = async (req, res) => {
    try {
      const record = await Model.findOneAndDelete({ _id: req.params.id, userId: req.user._id }).lean()
      if (!record) {
        return res.status(404).json({ success: false, message: `${config.label} record not found` })
      }

      if (record[config.documentField] && typeof record[config.documentField] === 'string' && record[config.documentField].startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '..', record[config.documentField])
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      }

      res.json({ success: true, message: `${config.label} record deleted successfully` })
    } catch (error) {
      console.error(`Error deleting ${config.name} record:`, error)
      res.status(500).json({ success: false, message: `Failed to delete ${config.label} record` })
    }
  }

  const markAsPaid = async (req, res) => {
    try {
      const record = await Model.findOne({ _id: req.params.id, userId: req.user._id })
      if (!record) {
        return res.status(404).json({ success: false, message: `${config.label} record not found` })
      }

      const totalField = config.totalField
      record[paidField] = normalizeNumber(record[totalField], 0)
      record[balanceField] = 0
      await record.save()

      res.json({ success: true, data: record })
    } catch (error) {
      console.error(`Error marking ${config.name} as paid:`, error)
      res.status(500).json({ success: false, message: `Failed to mark ${config.label} payment as paid` })
    }
  }

  const incrementWhatsapp = async (req, res) => {
    try {
      const record = await Model.findOne({ _id: req.params.id, userId: req.user._id })
      if (!record) {
        return res.status(404).json({ success: false, message: `${config.label} record not found` })
      }

      record.whatsappMessageCount = normalizeNumber(record.whatsappMessageCount, 0) + 1
      record.lastWhatsappSentAt = new Date()
      await record.save()

      res.json({
        success: true,
        data: {
          whatsappMessageCount: record.whatsappMessageCount,
          lastWhatsappSentAt: record.lastWhatsappSentAt,
        },
      })
    } catch (error) {
      console.error(`Error incrementing ${config.name} WhatsApp count:`, error)
      res.status(500).json({ success: false, message: `Failed to update ${config.label} WhatsApp count` })
    }
  }

  const getRenewalsList = async (req, res) => {
    try {
      const statusFilter = req.query.status || 'pending'

      const all = await Model.find({ userId: req.user._id }).lean()
      const withDaysLeft = all.map((r) => ({ ...r, daysLeft: getDaysToExpiry(r, expiryField) }))

      // FY bucketing for renewals uses the document's expiry date (expiryField).
      // This ensures filtering by FY (e.g. FY 2025-26 or FY 2026-27) filters policies based on when they expire.
      const getFYYear = (r) => {
        const dateValue = expiryField ? r[expiryField] : null
        if (!dateValue) return null
        const d = parseDateString(dateValue)
        if (!d) return null
        // Indian FY: Apr-Mar. If month >= April (index 3), FY starts this year.
        return d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1
      }

      const matchesFinancialYear = (r) => {
        if (!req.query.financialYear) return true
        const year = parseInt(req.query.financialYear, 10)
        if (isNaN(year)) return true
        return getFYYear(r) === year
      }

      // For the 'pending' renewal tab, only show records within the renewal window:
      // - daysLeft <= expiringDays  →  expiring soon (e.g. ≤60 days for insurance)
      // - daysLeft < 0              →  already expired (always show, no matter how old)
      // Records with 277d left etc. are NOT actionable yet and should not appear.
      // Renewed / opportunity / lost tabs show all records regardless of days left.
      const isRenewable = (r) => {
        if ((r.renewalStatus || 'pending') !== 'pending') return true // non-pending always pass
        const dl = r.daysLeft
        if (dl === null || dl === undefined) return false
        return dl <= expiringDays // covers both expired (dl<0) and expiring soon (dl<=60)
      }

      // Tab counts: pending count only includes actionable (renewable) records.
      const inFY = withDaysLeft.filter(matchesFinancialYear)
      const counts = inFY.reduce(
        (acc, r) => {
          const status = r.renewalStatus || 'pending'
          if (acc[status] !== undefined) {
            // For pending, only count records that are within the renewal window
            if (status === 'pending' && !isRenewable(r)) return acc
            acc[status] += 1
          }
          return acc
        },
        { pending: 0, renewed: 0, lost: 0, opportunity: 0 }
      )

      const result = inFY
        .filter((r) => (r.renewalStatus || 'pending') === statusFilter)
        .filter(isRenewable) // applies renewable window filter to pending; no-op for others
        .sort((a, b) => (a.daysLeft ?? 9999) - (b.daysLeft ?? 9999))

      // Return only the FY years that have actual document expirations (based on expiryField).
      res.json({ success: true, data: result, counts, financialYears: getFinancialYearsByField(all, expiryField) })
    } catch (error) {
      console.error(`Error fetching ${config.name} renewals list:`, error)
      res.status(500).json({ success: false, message: `Failed to fetch ${config.label} renewals list` })
    }
  }

  const updateRenewalStatus = async (req, res) => {
    try {
      const { status } = req.body
      if (!['pending', 'renewed', 'lost', 'opportunity'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status. Must be pending, renewed, lost, or opportunity' })
      }

      const record = await Model.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { renewalStatus: status, renewalStatusChangedAt: new Date() },
        { returnDocument: 'after', runValidators: true }
      ).lean()

      if (!record) {
        return res.status(404).json({ success: false, message: `${config.label} record not found` })
      }

      res.json({ success: true, data: record })
    } catch (error) {
      console.error(`Error updating ${config.name} renewal status:`, error)
      res.status(500).json({ success: false, message: `Failed to update ${config.label} renewal status` })
    }
  }

  const getById = async (req, res) => {
    try {
      const record = await Model.findOne({ _id: req.params.id, userId: req.user._id }).lean()
      if (!record) {
        return res.status(404).json({ success: false, message: `${config.label} record not found` })
      }

      const status = calculateStatus(record, expiryField, expiringDays)
      res.json({ success: true, data: { ...record, status } })
    } catch (error) {
      console.error(`Error fetching ${config.name} by id:`, error)
      res.status(500).json({ success: false, message: `Failed to fetch ${config.label} record` })
    }
  }

  return {
    getAll,
    getExpiringSoon,
    getExpired,
    getPendingPayment,
    getStatistics,
    getById,
    create,
    update,
    remove,
    markAsPaid,
    incrementWhatsapp,
    getRenewalsList,
    updateRenewalStatus,
  }
}

module.exports = { createRecordController, getFinancialYears }
