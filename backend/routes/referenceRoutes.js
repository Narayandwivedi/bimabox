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
    const { name, mobile, email, reference, address, otherInfo } = req.body
    let finalName = (name && name.trim()) || '';
    if (!finalName) {
      if (mobile && mobile.trim()) {
        finalName = `Client - ${mobile.trim()}`;
      } else if (email && email.trim()) {
        finalName = `Client - ${email.trim()}`;
      } else {
        const uniqueSuffix = Date.now().toString().slice(-6);
        finalName = `Client #${uniqueSuffix}`;
      }
    }
    const existing = await Reference.findOne({ userId: req.user._id, name: finalName.trim() })
    if (existing) {
      existing.mobile = mobile || ''
      existing.email = email || ''
      existing.reference = reference || ''
      existing.address = address || ''
      existing.otherInfo = otherInfo || ''
      await existing.save()
      return res.json({ success: true, data: existing })
    }
    const newRef = await Reference.create({
      userId: req.user._id,
      name: finalName.trim(),
      mobile: mobile || '',
      email: email || '',
      reference: reference || '',
      address: address || '',
      otherInfo: otherInfo || ''
    })
    res.status(201).json({ success: true, data: newRef })
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

router.put('/:id', async (req, res) => {
  try {
    const { name, mobile, email, reference, address, otherInfo } = req.body
    let finalName = (name && name.trim()) || '';
    if (!finalName) {
      if (mobile && mobile.trim()) {
        finalName = `Client - ${mobile.trim()}`;
      } else if (email && email.trim()) {
        finalName = `Client - ${email.trim()}`;
      } else {
        const uniqueSuffix = Date.now().toString().slice(-6);
        finalName = `Client #${uniqueSuffix}`;
      }
    }
    const existing = await Reference.findOne({ userId: req.user._id, name: finalName.trim() })
    if (existing && existing._id.toString() !== req.params.id) {
      return res.status(409).json({ success: false, message: 'A reference with this name already exists' })
    }
    const updatedRef = await Reference.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        name: finalName.trim(),
        mobile: mobile || '',
        email: email || '',
        reference: reference || '',
        address: address || '',
        otherInfo: otherInfo || ''
      },
      { new: true }
    )
    if (!updatedRef) {
      return res.status(404).json({ success: false, message: 'Reference not found' })
    }
    res.json({ success: true, data: updatedRef })
  } catch (error) {
    console.error('Error updating reference:', error)
    res.status(500).json({ success: false, message: 'Failed to update reference' })
  }
})

module.exports = router
