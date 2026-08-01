const express = require('express');
const { body } = require('express-validator');
const {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct, updateStock, reorderProducts
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');
const upload = require('../middleware/upload');

const router = express.Router();

const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('stock').optional().isNumeric().withMessage('Stock must be a number')
];

// Public
router.get('/',    getProducts);

// Admin only
router.put('/reorder',   protect, adminOnly, reorderProducts);
router.get('/:id',       getProduct);
router.post('/',          protect, adminOnly, upload.array('images', 8), productValidation, createProduct);
router.put('/:id',        protect, adminOnly, upload.array('images', 8), updateProduct);
router.delete('/:id',     protect, adminOnly, deleteProduct);
router.put('/:id/stock',  protect, adminOnly, updateStock);

module.exports = router;
