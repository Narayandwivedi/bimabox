const express = require('express')
const { requireAuth } = require('../middleware/auth')
const {
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController')

const router = express.Router()

router.use(requireAuth)

router.post('/', createVehicle)
router.put('/:id', updateVehicle)
router.delete('/:id', deleteVehicle)

module.exports = router
