const CalculatorConfig = require('../models/CalculatorConfig')

// Get all vehicle type configurations
exports.getAllConfigs = async (req, res) => {
  try {
    const configs = await CalculatorConfig.find({ isActive: true })
    const configMap = {}
    configs.forEach(cfg => {
      configMap[cfg.vehicleType] = cfg
    })
    res.json({ success: true, configs: configMap, raw: configs })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get single vehicle type config
exports.getConfigByVehicleType = async (req, res) => {
  try {
    const { vehicleType } = req.params
    const config = await CalculatorConfig.findOne({ vehicleType })
    if (!config) {
      return res.status(404).json({ success: false, message: 'Configuration not found' })
    }
    res.json({ success: true, config })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Create or Update vehicle type config
exports.upsertConfig = async (req, res) => {
  try {
    const { vehicleType } = req.params
    const updateData = req.body
    
    const config = await CalculatorConfig.findOneAndUpdate(
      { vehicleType },
      { $set: { ...updateData, vehicleType } },
      { new: true, upsert: true }
    )
    
    res.json({ success: true, message: 'Configuration saved successfully', config })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Add Custom Field (to one or all vehicle types)
exports.addCustomField = async (req, res) => {
  try {
    const { id, label, fieldType, rate, section, applyToVehicles, defaultValue, hasTpAddition, tpType, tpRate } = req.body
    
    if (!id || !label) {
      return res.status(400).json({ success: false, message: 'ID and Label are required' })
    }
    
    const newField = {
      id,
      label,
      fieldType: fieldType || 'fixed_amount',
      rate: Number(rate) || 0,
      section: section || 'addon',
      applyToVehicles: applyToVehicles || [],
      defaultValue: defaultValue || '',
      isActive: true,
      hasTpAddition: Boolean(hasTpAddition),
      tpType: tpType || 'fixed_amount',
      tpRate: Number(tpRate) || 0,
    }

    
    // If applyToVehicles is specified, update those configs. Otherwise update all.
    const query = (applyToVehicles && applyToVehicles.length > 0)
      ? { vehicleType: { $in: applyToVehicles } }
      : {}
      
    // Pull existing with same ID first to avoid duplicates, then push new field
    await CalculatorConfig.updateMany(query, { $pull: { customFields: { id } } })
    await CalculatorConfig.updateMany(query, { $push: { customFields: newField } })
    
    res.json({ success: true, message: 'Custom field added successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update Custom Field
exports.updateCustomField = async (req, res) => {
  try {
    const { fieldId } = req.params
    const fieldData = req.body
    
    const updateObj = {}
    for (const key in fieldData) {
      updateObj[`customFields.$.${key}`] = fieldData[key]
    }
    
    await CalculatorConfig.updateMany(
      { 'customFields.id': fieldId },
      { $set: updateObj }
    )
    
    res.json({ success: true, message: 'Custom field updated successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Delete Custom Field
exports.deleteCustomField = async (req, res) => {
  try {
    const { fieldId } = req.params
    await CalculatorConfig.updateMany(
      {},
      { $pull: { customFields: { id: fieldId } } }
    )
    res.json({ success: true, message: 'Custom field deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
