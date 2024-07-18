const express = require('express')
const router = express.Router()
const { getProducts, createProduct, getProductById, updateProduct, deleteProduct } = require('../controllers/productsController')

router.get('/', getProducts)

router.post('/', createProduct)

router.get('/:id', getProductById)

router.put('/:id', updateProduct)

router.delete('/:id', deleteProduct)

module.exports = router