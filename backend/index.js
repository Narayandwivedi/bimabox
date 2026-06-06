require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const vehicleRoutes = require('./routes/vehicleRoutes')
const fitnessRoutes = require('./routes/fitnessRoutes')
const taxRoutes = require('./routes/taxRoutes')
const pucRoutes = require('./routes/pucRoutes')
const gpsRoutes = require('./routes/gpsRoutes')
const insuranceRoutes = require('./routes/insuranceRoutes')
const permitRoutes = require('./routes/permitRoutes')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const ocrRoutes = require('./routes/ocrRoutes')
const uploadRoutes = require('./routes/uploadRoutes')
const whatsAppRoutes = require('./routes/whatsAppRoutes')
const whatsAppSessionManager = require('./services/whatsAppSessionManager')
const expiryReminderService = require('./services/expiryReminderService')

const app = express()
const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/transport'
const ALLOWED_ORIGINS = new Set([

  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://bimabox.in',
  'https://www.bimabox.in',
  'https://api.bimabox.in',
  'https://adm.bimabox.in',
  'http://bimabox.in',
  'http://api.bimabox.in',
])

app.use(express.json({ limit: '25mb' }))
app.use(express.urlencoded({ extended: true, limit: '25mb' }))

app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Vary', 'Origin')
  }
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }

  next()
})

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Backend is running' })
})

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/vehicle', vehicleRoutes)
app.use('/api/fitness', fitnessRoutes)
app.use('/api/tax', taxRoutes)
app.use('/api/puc', pucRoutes)
app.use('/api/gps', gpsRoutes)
app.use('/api/insurance', insuranceRoutes)
app.use('/api/permit', permitRoutes)
app.use('/api/kyc', require('./routes/kycRoutes'))
app.use('/api/references', require('./routes/referenceRoutes'))
app.use('/api/ocr', ocrRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/whatsapp', whatsAppRoutes)
app.use('/api/calculator', require('./routes/calculatorRoutes'))

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })

    whatsAppSessionManager.restoreSessions().catch((error) => {
      console.error('Failed to restore WhatsApp sessions:', error)
    })

    expiryReminderService.start()
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error)
    process.exit(1)
  })
