const buildUploadResponse = (imageData) => {
  const mimeMatch = imageData.match(/^data:([^;]+);base64,/)
  const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream'
  const base64Payload = imageData.split(',')[1] || ''
  const sizeInBytes = Buffer.byteLength(base64Payload, 'base64')

  return {
    path: imageData,
    sizeInMB: (sizeInBytes / (1024 * 1024)).toFixed(2),
    format: mimeType,
  }
}

const uploadRcImage = async (req, res) => {
  try {
    const { imageData } = req.body

    if (!imageData || typeof imageData !== 'string' || !imageData.startsWith('data:')) {
      return res.status(400).json({ success: false, message: 'Valid imageData is required' })
    }

    return res.json({
      success: true,
      data: buildUploadResponse(imageData),
    })
  } catch (error) {
    console.error('Error uploading RC image:', error)
    return res.status(500).json({ success: false, message: 'Failed to upload RC image' })
  }
}

const uploadDocument = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No document uploaded' })
    }
    
    // Convert to web path format
    const filePath = `/uploads/${req.file.filename}`
    
    return res.json({
      success: true,
      data: {
        path: filePath,
        sizeInMB: (req.file.size / (1024 * 1024)).toFixed(2),
        format: req.file.mimetype,
        originalName: req.file.originalname
      }
    })
  } catch (error) {
    console.error('Error uploading document:', error)
    return res.status(500).json({ success: false, message: 'Failed to upload document' })
  }
}

module.exports = {
  uploadRcImage,
  uploadDocument
}
