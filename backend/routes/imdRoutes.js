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
    const { name, mobile, email, agentCode, reference, address, otherInfo } = req.body
    let finalName = (name && name.trim()) || '';
    if (!finalName) {
      if (agentCode && agentCode.trim()) {
        finalName = `Agent - ${agentCode.trim()}`;
      } else if (mobile && mobile.trim()) {
        finalName = `Agent - ${mobile.trim()}`;
      } else if (email && email.trim()) {
        finalName = `Agent - ${email.trim()}`;
      } else {
        const uniqueSuffix = Date.now().toString().slice(-6);
        finalName = `Agent #${uniqueSuffix}`;
      }
    }
    const existing = await IMD.findOne({ userId: req.user._id, name: finalName.trim() })
    if (existing) {
      existing.mobile = mobile || ''
      existing.email = email || ''
      existing.agentCode = agentCode || ''
      existing.reference = reference || ''
      existing.address = address || ''
      existing.otherInfo = otherInfo || ''
      await existing.save()
      return res.json({ success: true, data: existing })
    }
    const newImd = await IMD.create({
      userId: req.user._id,
      name: finalName.trim(),
      mobile: mobile || '',
      email: email || '',
      agentCode: agentCode || '',
      reference: reference || '',
      address: address || '',
      otherInfo: otherInfo || ''
    })
    res.status(201).json({ success: true, data: newImd })
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
    const { name, mobile, email, agentCode, reference, address, otherInfo } = req.body
    let finalName = (name && name.trim()) || '';
    if (!finalName) {
      if (agentCode && agentCode.trim()) {
        finalName = `Agent - ${agentCode.trim()}`;
      } else if (mobile && mobile.trim()) {
        finalName = `Agent - ${mobile.trim()}`;
      } else if (email && email.trim()) {
        finalName = `Agent - ${email.trim()}`;
      } else {
        const uniqueSuffix = Date.now().toString().slice(-6);
        finalName = `Agent #${uniqueSuffix}`;
      }
    }
    const existing = await IMD.findOne({ userId: req.user._id, name: finalName.trim() })
    if (existing && existing._id.toString() !== req.params.id) {
      return res.status(409).json({ success: false, message: 'An IMD with this name already exists' })
    }
    const updatedImd = await IMD.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        name: finalName.trim(),
        mobile: mobile || '',
        email: email || '',
        agentCode: agentCode || '',
        reference: reference || '',
        address: address || '',
        otherInfo: otherInfo || ''
      },
      { new: true }
    )
    if (!updatedImd) {
      return res.status(404).json({ success: false, message: 'IMD not found' })
    }
    res.json({ success: true, data: updatedImd })
  } catch (error) {
    console.error('Error updating IMD:', error)
    res.status(500).json({ success: false, message: 'Failed to update IMD' })
  }
})

module.exports = router
