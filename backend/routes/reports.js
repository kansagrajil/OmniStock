const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getInventoryReport,
    exportPDF,
    exportExcel
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// @route   GET /api/reports/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard', protect, getDashboardStats);

// @route   GET /api/reports/inventory
// @desc    Get inventory report
// @access  Private
router.get('/inventory', protect, getInventoryReport);

// @route   GET /api/reports/export/pdf
// @desc    Export report as PDF
// @access  Private
router.get('/export/pdf', protect, exportPDF);

// @route   GET /api/reports/export/excel
// @desc    Export report as Excel
// @access  Private
router.get('/export/excel', protect, exportExcel);

module.exports = router;
