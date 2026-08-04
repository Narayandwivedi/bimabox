const mongoose = require('mongoose')

const paymentOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    planKey: {
      type: String,
      default: null,
    },
    durationMonths: {
      type: Number,
      default: null,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentId: {
      type: String,
      default: null,
    },
    signature: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: true, // Amount in paise (1 INR = 100 paise)
    },
    currency: {
      type: String,
      default: 'INR',
    },
    receipt: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['created', 'paid', 'failed'],
      default: 'created',
    },
    notes: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('PaymentOrder', paymentOrderSchema)
