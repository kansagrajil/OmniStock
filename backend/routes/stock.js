const express = require('express');
const router = express.Router();
const {
    stockIn,
    stockOut,
    getTransactions,
    getProductTransactions
} = require('../controllers/stockController');
const { protect } = require('../middleware/auth');

// @route   POST /api/stock/in
// @desc    Stock IN operation
// @access  Private
router.post('/in', protect, stockIn);

// @route   POST /api/stock/out
// @desc    Stock OUT operation
// @access  Private
router.post('/out', protect, stockOut);

// @route   GET /api/stock/transactions
// @desc    Get all transactions
// @access  Private
router.get('/transactions', protect, getTransactions);

// @route   GET /api/stock/transactions/:productId
// @desc    Get product transactions
// @access  Private
router.get('/transactions/:productId', protect, getProductTransactions);

module.exports = router;
