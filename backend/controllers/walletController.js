const User = require('../models/User')
const WalletTransaction = require('../models/WalletTransaction')

const getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance')
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    res.json({
      success: true,
      data: {
        balance: user.walletBalance || 0
      }
    })
  } catch (error) {
    console.error('Wallet balance error:', error)
    res.status(500).json({ success: false, message: 'Failed to get wallet balance' })
  }
}

const getWalletTransactions = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20))
    const skip = (page - 1) * limit

    const typeFilter = req.query.type
    const filter = { userId: req.user._id }
    if (typeFilter && ['credit', 'debit'].includes(typeFilter)) {
      filter.type = typeFilter
    }

    const [transactions, total] = await Promise.all([
      WalletTransaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      WalletTransaction.countDocuments(filter)
    ])

    const user = await User.findById(req.user._id).select('walletBalance')

    res.json({
      success: true,
      data: {
        balance: user ? user.walletBalance : 0,
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Wallet transactions error:', error)
    res.status(500).json({ success: false, message: 'Failed to get wallet transactions' })
  }
}

module.exports = { getWalletBalance, getWalletTransactions }
