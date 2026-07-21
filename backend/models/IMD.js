const mongoose = require('mongoose')

const IMDSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    trim: true
  },
  mobile: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  agentCode: {
    type: String,
    trim: true
  },
  reference: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  otherInfo: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

IMDSchema.index({ userId: 1, name: 1 }, { unique: true })

const IMD = mongoose.model('IMD', IMDSchema)

module.exports = IMD
