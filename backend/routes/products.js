const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

// @route   GET /api/products/low-stock
// @desc    Get low stock products
// @access  Private
router.get('/low-stock', protect, getLowStockProducts);

// @route   GET /api/products
// @desc    Get all products
// @access  Private
router.get('/', protect, getProducts);

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Private
router.get('/:id', protect, getProductById);

// @route   POST /api/products
// @desc    Create product
// @access  Private
router.post(
    '/',
    protect,
    upload.single('image'),
    [
        body('name').trim().notEmpty().withMessage('Product name is required'),
        body('sku').trim().notEmpty().withMessage('SKU is required'),
        body('category').notEmpty().withMessage('Category is required'),
        body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
        body('quantity').isInt({ min: 0 }).withMessage('Valid quantity is required')
    ],
    createProduct
);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private
router.put('/:id', protect, upload.single('image'), updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete('/:id', protect, deleteProduct);

module.exports = router;
