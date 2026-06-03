const express = require('express')
const Reference = require('../models/Reference')
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
    const references = await Reference.find(filter).sort({ name: 1 })
    res.json({ success: true, data: references })
  } catch (error) {
    console.error('Error fetching references:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch references' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Reference name is required' })
    }
    const existing = await Reference.findOne({ userId: req.user._id, name: name.trim() })
    if (existing) {
      return res.json({ success: true, data: existing })
    }
    const reference = await Reference.create({ userId: req.user._id, name: name.trim() })
    res.status(201).json({ success: true, data: reference })
  } catch (error) {
    console.error('Error creating reference:', error)
    res.status(500).json({ success: false, message: 'Failed to create reference' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const reference = await Reference.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    if (!reference) {
      return res.status(404).json({ success: false, message: 'Reference not found' })
    }
    res.json({ success: true, message: 'Reference deleted' })
  } catch (error) {
    console.error('Error deleting reference:', error)
    res.status(500).json({ success: false, message: 'Failed to delete reference' })
  }
})

module.exports = router
