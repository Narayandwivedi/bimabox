const express = require('express')
const multer = require('multer')
const path = require('path')
const { uploadRcImage, uploadDocument } = require('../controllers/uploadController')

const router = express.Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB
})

router.post('/rc-image', uploadRcImage)
router.post('/document', upload.single('document'), uploadDocument)

module.exports = router
