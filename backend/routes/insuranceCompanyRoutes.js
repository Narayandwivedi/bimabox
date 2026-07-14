const express = require('express')
const controller = require('../controllers/insuranceCompanyController')
const { requireAuth } = require('../middleware/auth')
const { requireAdminAuth } = require('../middleware/adminAuth')

const router = express.Router()

router.get('/', requireAuth, controller.getAll)
router.post('/', requireAdminAuth, controller.create)
router.put('/:id', requireAdminAuth, controller.update)
router.delete('/:id', requireAdminAuth, controller.remove)

module.exports = router
