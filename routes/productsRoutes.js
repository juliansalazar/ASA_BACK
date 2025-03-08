// productsRoutes.js
const express = require('express');
const router = express.Router();
const { getProducts, createProduct, getProductById, updateProduct, deleteProduct } = require('../controllers/productsController');
const { protect } = require('../middlewares/authMiddleware'); // Importa el middleware

router.get('/', getProducts);

router.post('/', protect, createProduct); // Proteger creación

router.get('/:id', getProductById);

router.put('/:id', protect, updateProduct); // Proteger actualización

router.delete('/:id', protect, deleteProduct); // Proteger eliminación

module.exports = router;