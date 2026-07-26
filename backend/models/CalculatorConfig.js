const mongoose = require('mongoose')

const customFieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  fieldType: { 
    type: String, 
    enum: ['percent_of_od', 'fixed_amount', 'percent_of_idv', 'toggle_percent'], 
    default: 'fixed_amount' 
  },
  rate: { type: Number, default: 0 },
  section: { type: String, enum: ['od', 'addon', 'tp'], default: 'addon' },
  applyToVehicles: [{ type: String }], // empty means all vehicle types
  defaultValue: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  hasTpAddition: { type: Boolean, default: false },
  tpType: { type: String, enum: ['fixed_amount', 'percent_of_tp'], default: 'fixed_amount' },
  tpRate: { type: Number, default: 0 }
}, { _id: false })


const calculatorConfigSchema = new mongoose.Schema({
  vehicleType: { type: String, required: true, unique: true }, // e.g., 'private_car', 'two_wheeler', 'gcv', etc.
  label: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  
  // OD rates structure: { upto_5: { A: ..., B: ... }, 5_to_7: ..., above_7: ... }
  odRates: { type: mongoose.Schema.Types.Mixed, default: {} },
  
  // TP rates structure: { tpByCC: [], tp3YrsByCC: [], electricTP1yr: [], electricTP3yr: [], tpByGVW: [], ... }
  tpRates: { type: mongoose.Schema.Types.Mixed, default: {} },
  
  // Extra rates e.g. imt23Rate: 15, extraPer100kg: 27
  extraRates: { type: mongoose.Schema.Types.Mixed, default: {} },
  
  // Subtypes for 3W, PCV, MiscD, etc.
  subtypes: { type: Array, default: [] },
  
  // Add OD brackets (e.g. for PCV)
  addOD: { type: Array, default: [] },
  
  // GST rates
  gstRate: { type: Number, default: 18 },
  gstTpRate: { type: Number, default: 18 },
  
  // Custom fields for add-ons or TP or OD modifiers (e.g. IMT 23, restricted TPPD)
  customFields: [customFieldSchema]
}, { timestamps: true })

module.exports = mongoose.model('CalculatorConfig', calculatorConfigSchema)
