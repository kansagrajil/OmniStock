const express = require('express');
const router = express.Router();
const {
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
} = require('../controllers/supplierController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.route('/')
    .get(protect, getSuppliers)
    .post(protect, upload.single('image'), createSupplier);

router.route('/:id')
    .get(protect, getSupplierById)
    .put(protect, upload.single('image'), updateSupplier)
    .delete(protect, deleteSupplier);

module.exports = router;
