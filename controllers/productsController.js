const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');

// Obtener todos los productos
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}); // Obtener todos los productos
  res.status(200).json(products);
});

// Crear un nuevo producto
const createProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image } = req.body;

  // Validación básica
  if (!name || !price) {
    res.status(400);
    throw new Error('Por favor, proporciona al menos un nombre y precio');
  }

  const product = await Product.create({
    name,
    price,
    description: description || '', // Valor por defecto si no se proporciona
    image: image || '', // Valor por defecto si no se proporciona
  });

  res.status(201).json(product);
});

// Obtener un producto por ID
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
  res.status(200).json(product);
});

// Actualizar un producto
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  const { name, price, description, image } = req.body;
  if (name) product.name = name;
  if (price) product.price = price;
  if (description) product.description = description;
  if (image) product.image = image;

  const updatedProduct = await product.save();
  res.status(200).json(updatedProduct);
});

// Eliminar un producto
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  await product.deleteOne();
  res.status(200).json({ message: 'Producto eliminado' });
});

module.exports = {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
};