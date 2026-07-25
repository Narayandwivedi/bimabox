const crypto = require('crypto')
const User = require('../models/User')

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 6

function generateRandomCode() {
  let code = ''
  const bytes = crypto.randomBytes(CODE_LENGTH)
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARS[bytes[i] % CHARS.length]
  }
  return code
}

async function generateUniqueReferralCode(maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateRandomCode()
    const existing = await User.findOne({ referralCode: code })
    if (!existing) {
      return code
    }
  }
  throw new Error('Failed to generate unique referral code after ' + maxAttempts + ' attempts')
}

module.exports = { generateUniqueReferralCode }
