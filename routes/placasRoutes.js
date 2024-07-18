const express = require('express')
const router = express.Router()
const { getPlacas, crearPlacas, updatePlacas, deletePlacas } = require('../controllers/placasController')
const { protect } = require('../middlewares/authMiddleware')

router.get('/', protect, getPlacas)
router.post('/', protect, crearPlacas)
router.put('/:id', protect, updatePlacas)
router.delete('/:id', protect, deletePlacas)

module.exports = router