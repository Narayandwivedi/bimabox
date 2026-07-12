const express = require('express')
const IMD = require('../models/IMD')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    const { search } = req.query
    let filter = { userId: req.user._id }
    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: 'i' }
    }
    const imds = await IMD.find(filter).sort({ name: 1 })
    res.json({ success: true, data: imds })
  } catch (error) {
    console.error('Error fetching IMDs:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch IMDs' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name, mobile, email } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'IMD name is required' })
    }
    const existing = await IMD.findOne({ userId: req.user._id, name: name.trim() })
    if (existing) {
      if (mobile !== undefined || email !== undefined) {
        existing.mobile = mobile || ''
        existing.email = email || ''
        await existing.save()
        return res.json({ success: true, data: existing })
      }
      return res.json({ success: true, data: existing })
    }
    const imd = await IMD.create({ userId: req.user._id, name: name.trim(), mobile: mobile || '', email: email || '' })
    res.status(201).json({ success: true, data: imd })
  } catch (error) {
    console.error('Error creating IMD:', error)
    res.status(500).json({ success: false, message: 'Failed to create IMD' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const imd = await IMD.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    if (!imd) {
      return res.status(404).json({ success: false, message: 'IMD not found' })
    }
    res.json({ success: true, message: 'IMD deleted' })
  } catch (error) {
    console.error('Error deleting IMD:', error)
    res.status(500).json({ success: false, message: 'Failed to delete IMD' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { name, mobile, email } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'IMD name is required' })
    }
    const existing = await IMD.findOne({ userId: req.user._id, name: name.trim() })
    if (existing && existing._id.toString() !== req.params.id) {
      return res.status(409).json({ success: false, message: 'An IMD with this name already exists' })
    }
    const imd = await IMD.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name: name.trim(), mobile: mobile || '', email: email || '' },
      { new: true }
    )
    if (!imd) {
      return res.status(404).json({ success: false, message: 'IMD not found' })
    }
    res.json({ success: true, data: imd })
  } catch (error) {
    console.error('Error updating IMD:', error)
    res.status(500).json({ success: false, message: 'Failed to update IMD' })
  }
})

module.exports = router
