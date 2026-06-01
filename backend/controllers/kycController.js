const Kyc = require('../models/Kyc')
const path = require('path')
const fs = require('fs')

const uploadDir = path.join(__dirname, '..', 'uploads', 'kyc_docs')

const ensureUploadDir = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
}

const saveBase64File = (dataStr) => {
  if (!dataStr || !dataStr.startsWith('data:')) return dataStr
  const matches = dataStr.match(/^data:([^;]+);base64,(.+)$/)
  if (!matches || matches.length !== 3) return dataStr

  const mimeType = matches[1]
  const base64Data = matches[2]
  let ext = 'pdf'
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg'
  else if (mimeType.includes('png')) ext = 'png'
  else if (mimeType.includes('pdf')) ext = 'pdf'

  ensureUploadDir()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const filePath = path.join(uploadDir, fileName)
  fs.writeFileSync(filePath, base64Data, 'base64')
  return `/uploads/kyc_docs/${fileName}`
}

const getAll = async (req, res) => {
  try {
    const { search, documentType } = req.query
    const filter = { userId: req.user._id }

    if (documentType && documentType !== 'All') {
      filter.documentType = documentType
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' }
    }

    const records = await Kyc.find(filter).sort({ createdAt: -1 })
    res.json({ success: true, data: records })
  } catch (error) {
    console.error('KYC getAll error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch KYC records' })
  }
}

const getById = async (req, res) => {
  try {
    const record = await Kyc.findOne({ _id: req.params.id, userId: req.user._id })
    if (!record) return res.status(404).json({ success: false, message: 'KYC record not found' })
    res.json({ success: true, data: record })
  } catch (error) {
    console.error('KYC getById error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch KYC record' })
  }
}

const create = async (req, res) => {
  try {
    const { name, documentType, otherDocumentType, documentNumber, aadharFrontDocument, aadharBackDocument, documentImage, remarks } = req.body

    if (!name || !documentType) {
      return res.status(400).json({ success: false, message: 'Name and document type are required' })
    }

    const payload = {
      userId: req.user._id,
      name: String(name).trim(),
      documentType,
      otherDocumentType: otherDocumentType ? String(otherDocumentType).trim() : '',
      documentNumber: documentNumber ? String(documentNumber).trim() : '',
      remarks: remarks ? String(remarks).trim() : ''
    }

    if (documentType === 'Aadhar') {
      payload.aadharFrontDocument = saveBase64File(aadharFrontDocument)
      payload.aadharBackDocument = saveBase64File(aadharBackDocument)
    } else {
      payload.documentImage = saveBase64File(documentImage)
    }

    const record = await Kyc.create(payload)
    res.status(201).json({ success: true, data: record })
  } catch (error) {
    console.error('KYC create error:', error)
    res.status(500).json({ success: false, message: 'Failed to create KYC record' })
  }
}

const update = async (req, res) => {
  try {
    const existing = await Kyc.findOne({ _id: req.params.id, userId: req.user._id })
    if (!existing) return res.status(404).json({ success: false, message: 'KYC record not found' })

    const { name, documentType, otherDocumentType, documentNumber, aadharFrontDocument, aadharBackDocument, documentImage, remarks } = req.body

    if (name) existing.name = String(name).trim()
    if (documentType) existing.documentType = documentType
    if (otherDocumentType !== undefined) existing.otherDocumentType = String(otherDocumentType).trim()
    if (documentNumber !== undefined) existing.documentNumber = String(documentNumber).trim()
    if (remarks !== undefined) existing.remarks = String(remarks).trim()

    if (documentType === 'Aadhar') {
      if (aadharFrontDocument) existing.aadharFrontDocument = saveBase64File(aadharFrontDocument)
      if (aadharBackDocument) existing.aadharBackDocument = saveBase64File(aadharBackDocument)
    } else {
      if (documentImage) existing.documentImage = saveBase64File(documentImage)
    }

    await existing.save()
    res.json({ success: true, data: existing })
  } catch (error) {
    console.error('KYC update error:', error)
    res.status(500).json({ success: false, message: 'Failed to update KYC record' })
  }
}

const remove = async (req, res) => {
  try {
    const record = await Kyc.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    if (!record) return res.status(404).json({ success: false, message: 'KYC record not found' })
    res.json({ success: true, message: 'KYC record deleted' })
  } catch (error) {
    console.error('KYC delete error:', error)
    res.status(500).json({ success: false, message: 'Failed to delete KYC record' })
  }
}

module.exports = { getAll, getById, create, update, remove }
