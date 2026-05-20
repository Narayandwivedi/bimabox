const rateLimit = require('express-rate-limit')

// In-memory failed attempts store: IP -> Array of failed attempt timestamps
const failedAttemptsStore = new Map()

// Helper to record a failed attempt
const recordFailedAttempt = (ip) => {
  const now = Date.now()
  if (!failedAttemptsStore.has(ip)) {
    failedAttemptsStore.set(ip, [])
  }
  const attempts = failedAttemptsStore.get(ip)
  attempts.push(now)
  
  // Keep only attempts within the last 24 hours (86,400,000 milliseconds)
  const cutoff = now - 24 * 60 * 60 * 1000
  const validAttempts = attempts.filter(time => time > cutoff)
  failedAttemptsStore.set(ip, validAttempts)
}

// Helper to check if blocked
const isIpBlocked = (ip) => {
  const now = Date.now()
  if (!failedAttemptsStore.has(ip)) return false
  
  const attempts = failedAttemptsStore.get(ip)
  const cutoff = now - 24 * 60 * 60 * 1000
  const validAttempts = attempts.filter(time => time > cutoff)
  failedAttemptsStore.set(ip, validAttempts)
  
  return validAttempts.length >= 3
}

// General API request rate limiter for login page to prevent spam
const loginRequestLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Check if IP is blocked due to 3 or more wrong password attempts in 24 hours
const checkIpBlock = async (req, res, next) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
    if (isIpBlocked(ip)) {
      return res.status(423).json({
        success: false,
        isBlocked: true,
        message: 'Your IP is blocked for 24 hours due to 3 consecutive failed login attempts.'
      })
    }
    next()
  } catch (error) {
    console.error('Error checking IP block status:', error)
    next()
  }
}

module.exports = {
  loginRequestLimiter,
  checkIpBlock,
  recordFailedAttempt
}
