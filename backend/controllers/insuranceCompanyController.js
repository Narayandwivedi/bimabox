const InsuranceCompany = require('../models/InsuranceCompany')

const getAll = async (req, res) => {
  try {
    const companies = await InsuranceCompany.find().sort({ name: 1 }).lean()
    res.json({ success: true, data: companies })
  } catch (error) {
    console.error('Error fetching insurance companies:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch insurance companies' })
  }
}

const create = async (req, res) => {
  try {
    const { name } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Company name is required' })
    }
    const company = await InsuranceCompany.create({ name: name.trim() })
    res.status(201).json({ success: true, data: company })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Company name already exists' })
    }
    console.error('Error creating insurance company:', error)
    res.status(500).json({ success: false, message: 'Failed to create insurance company' })
  }
}

const update = async (req, res) => {
  try {
    const { name } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Company name is required' })
    }
    const company = await InsuranceCompany.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { returnDocument: 'after', runValidators: true }
    ).lean()
    if (!company) {
      return res.status(404).json({ success: false, message: 'Insurance company not found' })
    }
    res.json({ success: true, data: company })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Company name already exists' })
    }
    console.error('Error updating insurance company:', error)
    res.status(500).json({ success: false, message: 'Failed to update insurance company' })
  }
}

const remove = async (req, res) => {
  try {
    const company = await InsuranceCompany.findByIdAndDelete(req.params.id).lean()
    if (!company) {
      return res.status(404).json({ success: false, message: 'Insurance company not found' })
    }
    res.json({ success: true, message: 'Insurance company deleted' })
  } catch (error) {
    console.error('Error deleting insurance company:', error)
    res.status(500).json({ success: false, message: 'Failed to delete insurance company' })
  }
}

module.exports = { getAll, create, update, remove }
