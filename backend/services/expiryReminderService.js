const Fitness = require('../models/Fitness')
const Tax = require('../models/Tax')
const Puc = require('../models/Puc')
const Insurance = require('../models/Insurance')
const Gps = require('../models/Gps')
const User = require('../models/User')
const WhatsAppReminderLog = require('../models/WhatsAppReminderLog')
const whatsAppSessionManager = require('./whatsAppSessionManager')

const ALERT_STAGES = {
  window_14_to_8: 'window_14_to_8',
  window_7_to_1: 'window_7_to_1',
  on_expiry_day: 'on_expiry_day',
}

const ALERT_LABELS = {
  window_14_to_8: '14 to 8 days before expiry',
  window_7_to_1: '7 to 1 days before expiry',
  on_expiry_day: 'today expiry alert',
}

const parseDateString = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null

  const value = dateStr.trim()
  if (!value) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
      return date
    }
    return null
  }

  const parts = value.split(/[/-]/)
  if (parts.length !== 3) return null

  const first = Number(parts[0])
  const second = Number(parts[1]) - 1
  const third = Number(parts[2])
  if ([first, second, third].some(Number.isNaN)) return null

  const date = new Date(third, second, first)
  if (date.getFullYear() === third && date.getMonth() === second && date.getDate() === first) {
    return date
  }

  return null
}

const daysUntil = (dateStr) => {
  const date = parseDateString(dateStr)
  if (!date) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

const normalizeMobile = (mobile) => String(mobile || '').replace(/[^\d]/g, '')

const getAlertStage = (daysRemaining) => {
  if (daysRemaining === 0) {
    return 'on_expiry_day'
  }
  if (daysRemaining >= 8 && daysRemaining <= 14) {
    return 'window_14_to_8'
  }
  if (daysRemaining >= 1 && daysRemaining <= 7) {
    return 'window_7_to_1'
  }
  return null
}

const buildMessage = ({ label, vehicleNumber, validTo, ownerName, alertStage }) => {
  const recipient = ownerName ? `Dear ${ownerName},` : 'Dear Customer,'

  if (alertStage === 'window_14_to_8') {
    return `${recipient}

Your ${label} for vehicle ${vehicleNumber} is expiring soon on ${validTo}.
Please renew it soon.

Thank you.`
  }

  if (alertStage === 'window_7_to_1') {
    return `${recipient}

Your ${label} for vehicle ${vehicleNumber} will expire within 7 days on ${validTo}.
Please renew it soon to avoid any disruptions.

Thank you.`
  }

  if (alertStage === 'on_expiry_day') {
    return `${recipient}

Your ${label} for vehicle ${vehicleNumber} is expiring today (${validTo}).
Please renew it immediately.

Thank you.`
  }

  return null
}

class ExpiryReminderService {
  constructor() {
    this.intervalHandle = null
    this.running = false
  }

  async resolveMobile(record) {
    if (record.userId) {
      const user = await User.findById(record.userId).select('mobile').lean()
      const userMobile = normalizeMobile(user?.mobile)
      if (userMobile) return userMobile
    }
    return ''
  }

  async upsertReminderLog({ record, label, expiryDate, alertStage, mobile, message, status, errorMessage }) {
    await WhatsAppReminderLog.findOneAndUpdate(
      {
        recordId: record._id,
        recordType: label,
        expiryDate,
        alertStage,
      },
      {
        $set: {
          vehicleNumber: record.vehicleNumber || '',
          mobileNumber: mobile || '',
          message: message || '',
          status,
          error: errorMessage || '',
          sentAt: status === 'sent' ? new Date() : null,
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
      }
    )
  }

  async processRecords({ Model, label, expiryField }) {
    const records = await Model.find({
      isRenewed: { $ne: true },
    }).lean()

    let sentCount = 0
    let failedCount = 0

    for (const record of records) {
      const daysRemaining = daysUntil(record[expiryField])
      if (daysRemaining === null) continue
      const alertStage = getAlertStage(daysRemaining)
      if (!alertStage) continue
      if (Array.isArray(record.whatsappReminderStages) && record.whatsappReminderStages.includes(alertStage)) {
        continue
      }

      const mobile = await this.resolveMobile(record)
      const message = buildMessage({
        label,
        vehicleNumber: record.vehicleNumber || 'N/A',
        validTo: record[expiryField] || 'N/A',
        ownerName: record.ownerName || record.policyHolderName || '',
        alertStage,
      })

      if (!mobile) {
        await this.upsertReminderLog({
          record,
          label,
          expiryDate: record[expiryField] || '',
          alertStage,
          mobile: '',
          message,
          status: 'failed',
          errorMessage: 'Mobile number not available',
        })
        failedCount += 1
        continue
      }

      try {
        await whatsAppSessionManager.sendTextMessage(mobile, message)
        await Model.findByIdAndUpdate(record._id, {
          $set: {
            lastWhatsappSentAt: new Date(),
            lastWhatsappReminderFor: record[expiryField] || null,
          },
          $addToSet: { whatsappReminderStages: alertStage },
          $inc: { whatsappMessageCount: 1 },
        })
        await this.upsertReminderLog({
          record,
          label,
          expiryDate: record[expiryField] || '',
          alertStage,
          mobile,
          message,
          status: 'sent',
          errorMessage: '',
        })
        sentCount += 1
      } catch (error) {
        await this.upsertReminderLog({
          record,
          label,
          expiryDate: record[expiryField] || '',
          alertStage,
          mobile,
          message,
          status: 'failed',
          errorMessage: error.message || 'Failed to send reminder',
        })
        console.error(`Failed to send ${label} reminder for ${record.vehicleNumber}:`, error.message)
        failedCount += 1
      }
    }

    return { sentCount, failedCount }
  }

  async runOnce() {
    const hasApiKey = !!process.env.WHATSAPP_API_KEY
    if (this.running) {
      return { skipped: true }
    }

    if (!hasApiKey) {
      const activeSession = await whatsAppSessionManager.getActiveSession()
      if (!activeSession || !whatsAppSessionManager.hasClient(activeSession.sessionKey)) {
        return { skipped: true }
      }
    }

    this.running = true
    try {
      const results = await Promise.all([
        this.processRecords({ Model: Fitness, label: 'Fitness', expiryField: 'validTo' }),
        this.processRecords({ Model: Tax, label: 'Tax', expiryField: 'taxTo' }),
        this.processRecords({ Model: Puc, label: 'PUC', expiryField: 'validTo' }),
        this.processRecords({ Model: Insurance, label: 'Insurance', expiryField: 'validTo' }),
        this.processRecords({ Model: Gps, label: 'GPS', expiryField: 'validTo' }),
      ])

      return {
        skipped: false,
        sent: {
          fitness: results[0].sentCount,
          tax: results[1].sentCount,
          puc: results[2].sentCount,
          insurance: results[3].sentCount,
          gps: results[4].sentCount,
        },
        failed: {
          fitness: results[0].failedCount,
          tax: results[1].failedCount,
          puc: results[2].failedCount,
          insurance: results[3].failedCount,
          gps: results[4].failedCount,
        },
      }
    } finally {
      this.running = false
    }
  }

  async getLogs(limit = 100) {
    const logs = await WhatsAppReminderLog.find({})
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean()

    return logs.map((log) => ({
      ...log,
      alertLabel: ALERT_LABELS[log.alertStage] || log.alertStage,
    }))
  }

  start() {
    if (this.intervalHandle) return

    this.runOnce().catch((error) => {
      console.error('Initial expiry reminder run failed:', error)
    })

    this.intervalHandle = setInterval(() => {
      this.runOnce().catch((error) => {
        console.error('Expiry reminder service failed:', error)
      })
    }, 12 * 60 * 60 * 1000)
  }

  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle)
      this.intervalHandle = null
    }
  }
}

module.exports = new ExpiryReminderService()
