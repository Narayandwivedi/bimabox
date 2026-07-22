const mongoose = require('mongoose')

const walletTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  referenceType: {
    type: String,
    trim: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema)
