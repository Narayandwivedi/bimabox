const Rc = require('../models/Rc')
const fs = require('fs')
const path = require('path')

const processBase64Image = (dataUrl, vehicleNumber, side) => {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl
  const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/)
  if (!matches) return dataUrl
  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1]
  const buffer = Buffer.from(matches[2], 'base64')
  const filename = `RC_${vehicleNumber}_${side}_${Date.now()}.${ext}`
  const uploadDir = path.join(__dirname, '..', 'uploads', 'rto_docs')
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
  fs.writeFileSync(path.join(uploadDir, filename), buffer)
  return `/uploads/rto_docs/${filename}`
}

const getAll = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.max(Number(req.query.limit) || 20, 1)
    const search = (req.query.search || '').trim()

    const query = { userId: req.user._id }
    if (search) {
      query.$or = [
        { vehicleNumber: { $regex: search, $options: 'i' } },
        { chassisNo: { $regex: search, $options: 'i' } },
        { engineNo: { $regex: search, $options: 'i' } },
      ]
    }

    const totalRecords = await Rc.countDocuments(query)
    const records = await Rc.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean()
    const data = records.map(r => ({ ...r, status: 'active' }))

    res.json({
      success: true,
      data,
      pagination: { currentPage: page, totalPages: Math.max(Math.ceil(totalRecords / limit), 1), totalRecords, limit },
    })
  } catch (error) {
    console.error('Error fetching RC records:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch RC records' })
  }
}

const getStatistics = async (req, res) => {
  try {
    const total = await Rc.countDocuments({ userId: req.user._id })
    res.json({ success: true, data: { total, active: total, expiringSoon: 0, expired: 0, pendingPaymentCount: 0, pendingPaymentAmount: 0 } })
  } catch (error) {
    console.error('Error fetching RC statistics:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch RC statistics' })
  }
}

const getById = async (req, res) => {
  try {
    const record = await Rc.findOne({ _id: req.params.id, userId: req.user._id }).lean()
    if (!record) return res.status(404).json({ success: false, message: 'RC record not found' })
    res.json({ success: true, data: { ...record, status: 'active' } })
  } catch (error) {
    console.error('Error fetching RC record:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch RC record' })
  }
}

const create = async (req, res) => {
  try {
    const { vehicleNumber, chassisNo, engineNo, make, model, rcFrontImageData, rcBackImageData } = req.body

    if (!vehicleNumber || !vehicleNumber.trim()) {
      return res.status(400).json({ success: false, message: 'Vehicle number is required' })
    }

    const vehicleNo = vehicleNumber.trim().toUpperCase()

    const payload = {
      userId: req.user._id,
      vehicleNumber: vehicleNo,
      chassisNo: (chassisNo || '').trim(),
      engineNo: (engineNo || '').trim(),
      make: (make || '').trim(),
      model: (model || '').trim(),
    }

    if (rcFrontImageData) payload.rcFrontImage = processBase64Image(rcFrontImageData, vehicleNo, 'front')
    if (rcBackImageData) payload.rcBackImage = processBase64Image(rcBackImageData, vehicleNo, 'back')

    const record = await Rc.create(payload)
    res.status(201).json({ success: true, data: record })
  } catch (error) {
    console.error('Error creating RC record:', error)
    res.status(500).json({ success: false, message: 'Failed to create RC record' })
  }
}

const update = async (req, res) => {
  try {
    const { vehicleNumber, chassisNo, engineNo, make, model, rcFrontImageData, rcBackImageData } = req.body

    const vehicleNo = (vehicleNumber || '').trim().toUpperCase()
    const payload = {}
    if (vehicleNumber) payload.vehicleNumber = vehicleNo
    if (chassisNo !== undefined) payload.chassisNo = (chassisNo || '').trim()
    if (engineNo !== undefined) payload.engineNo = (engineNo || '').trim()
    if (make !== undefined) payload.make = (make || '').trim()
    if (model !== undefined) payload.model = (model || '').trim()

    if (rcFrontImageData) payload.rcFrontImage = processBase64Image(rcFrontImageData, vehicleNo || 'RC', 'front')
    if (rcBackImageData) payload.rcBackImage = processBase64Image(rcBackImageData, vehicleNo || 'RC', 'back')

    const record = await Rc.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      payload,
      { returnDocument: 'after', runValidators: true }
    )

    if (!record) return res.status(404).json({ success: false, message: 'RC record not found' })
    res.json({ success: true, data: record })
  } catch (error) {
    console.error('Error updating RC record:', error)
    res.status(500).json({ success: false, message: 'Failed to update RC record' })
  }
}

const remove = async (req, res) => {
  try {
    const record = await Rc.findOneAndDelete({ _id: req.params.id, userId: req.user._id }).lean()
    if (!record) return res.status(404).json({ success: false, message: 'RC record not found' })

    ;['rcFrontImage', 'rcBackImage'].forEach(field => {
      if (record[field] && typeof record[field] === 'string' && record[field].startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '..', record[field])
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
      }
    })

    res.json({ success: true, message: 'RC record deleted successfully' })
  } catch (error) {
    console.error('Error deleting RC record:', error)
    res.status(500).json({ success: false, message: 'Failed to delete RC record' })
  }
}

const incrementWhatsapp = async (req, res) => {
  try {
    const record = await Rc.findOne({ _id: req.params.id, userId: req.user._id })
    if (!record) return res.status(404).json({ success: false, message: 'RC record not found' })
    record.whatsappMessageCount = (record.whatsappMessageCount || 0) + 1
    record.lastWhatsappSentAt = new Date()
    await record.save()
    res.json({ success: true, data: { whatsappMessageCount: record.whatsappMessageCount, lastWhatsappSentAt: record.lastWhatsappSentAt } })
  } catch (error) {
    console.error('Error incrementing RC WhatsApp count:', error)
    res.status(500).json({ success: false, message: 'Failed to update RC WhatsApp count' })
  }
}

module.exports = { getAll, getStatistics, getById, create, update, remove, incrementWhatsapp }
