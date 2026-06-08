const mongoose = require('mongoose')

const kycSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: { type: String, required: true, trim: true },
  documentType: {
    type: String,
    required: true,
    enum: ['Aadhar', 'PAN', 'GST', 'Other']
  },
  otherDocumentType: { type: String, trim: true },
  documentNumber: { type: String, trim: true },
  documentFrontImg: { type: String, trim: true },
  documentBackImg: { type: String, trim: true },
  documentImage: { type: String, trim: true },
  remarks: { type: String, trim: true }
}, { timestamps: true })

kycSchema.index({ name: 1 })
kycSchema.index({ documentType: 1 })
kycSchema.index({ createdAt: -1 })

const Kyc = mongoose.model('Kyc', kycSchema)
module.exports = Kyc
