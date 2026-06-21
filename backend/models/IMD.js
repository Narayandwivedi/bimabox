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
    required: true,
    trim: true
  }
}, {
  timestamps: true
})

IMDSchema.index({ userId: 1, name: 1 }, { unique: true })

const IMD = mongoose.model('IMD', IMDSchema)

module.exports = IMD
