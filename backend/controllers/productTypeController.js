const ProductType = require('../models/ProductType')
const Insurance = require('../models/Insurance')

const DEFAULT_PRODUCT_TYPES = [
  'GCV', 'GCV-3W', 'Pvt. Car', 'Taxi', 'Two Wheeler', 'Mis-D', 'PCV', 'PCV-3W',
  'Health', 'Life', 'Fire', 'Burglary', 'WC', 'CPM', 'Travel', 'Marine', 'GPA', 'GMC',
  'CAR', 'IAR', 'EAR', 'SCHOOL BUS', 'LIABILITY', 'SECURITY BOND'
]

const backfillProductTypeIds = async () => {
  try {
    const types = await ProductType.find().lean()
    for (const t of types) {
      const escaped = t.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      await Insurance.updateMany(
        {
          $or: [{ productTypeId: { $exists: false } }, { productTypeId: null }],
          product: { $regex: new RegExp(`^${escaped}$`, 'i') }
        },
        { $set: { productTypeId: t._id } }
      )
    }
  } catch (error) {
    console.error('Error backfilling productTypeIds:', error)
  }
}

const seedDefaultProductTypes = async () => {
  try {
    const count = await ProductType.countDocuments()
    if (count === 0) {
      const docs = DEFAULT_PRODUCT_TYPES.map(name => ({ name }))
      await ProductType.insertMany(docs, { ordered: false })
      console.log(`[ProductType] Seeded ${docs.length} default product types.`)
    }
    await backfillProductTypeIds()
  } catch (error) {
    console.error('Error seeding default product types:', error)
  }
}

const getAll = async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    const types = await ProductType.find().sort({ name: 1 }).lean()
    res.json({ success: true, data: types })
  } catch (error) {
    console.error('Error fetching product types:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch product types' })
  }
}

const create = async (req, res) => {
  try {
    const { name } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required' })
    }
    const type = await ProductType.create({ name: name.trim() })
    res.status(201).json({ success: true, data: type })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Product type already exists' })
    }
    console.error('Error creating product type:', error)
    res.status(500).json({ success: false, message: 'Failed to create product type' })
  }
}

const update = async (req, res) => {
  try {
    const { name } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required' })
    }

    const existing = await ProductType.findById(req.params.id).lean()
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product type not found' })
    }

    const oldName = existing.name
    const newName = name.trim()

    const updatedType = await ProductType.findByIdAndUpdate(
      req.params.id,
      { name: newName },
      { returnDocument: 'after', runValidators: true }
    ).lean()

    if (!updatedType) {
      return res.status(404).json({ success: false, message: 'Product type not found' })
    }

    if (oldName !== newName) {
      await Insurance.updateMany(
        { $or: [{ productTypeId: updatedType._id }, { product: oldName }] },
        { $set: { productTypeId: updatedType._id } }
      )
      console.log(`[ProductType] Linked productTypeId for updated product "${oldName}" -> "${newName}" while preserving historical name snapshot`)
    }

    res.json({ success: true, data: updatedType })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Product type already exists' })
    }
    console.error('Error updating product type:', error)
    res.status(500).json({ success: false, message: 'Failed to update product type' })
  }
}

const remove = async (req, res) => {
  try {
    const type = await ProductType.findByIdAndDelete(req.params.id).lean()
    if (!type) {
      return res.status(404).json({ success: false, message: 'Product type not found' })
    }
    res.json({ success: true, message: 'Product type deleted' })
  } catch (error) {
    console.error('Error deleting product type:', error)
    res.status(500).json({ success: false, message: 'Failed to delete product type' })
  }
}

module.exports = { seedDefaultProductTypes, getAll, create, update, remove }
