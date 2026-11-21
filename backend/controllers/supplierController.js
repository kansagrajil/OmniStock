const Supplier = require('../models/Supplier');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find({ createdBy: req.user.id }).sort({ name: 1 });
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Private
const getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found or not authorized' });
        }

        res.json(supplier);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private
const createSupplier = async (req, res) => {
    try {
        const supplierData = {
            ...req.body,
            createdBy: req.user._id
        };

        if (req.file) {
            supplierData.image = req.file.filename;
        }

        console.log('[Supplier] Creating supplier:', req.body.name);
        const supplier = await Supplier.create(supplierData);
        res.status(201).json(supplier);
    } catch (error) {
        console.error('[Supplier Error] Save failed:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private
const updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found or not authorized' });
        }

        Object.keys(req.body).forEach(key => {
            supplier[key] = req.body[key];
        });

        if (req.file) {
            supplier.image = req.file.filename;
        }

        const updatedSupplier = await supplier.save();
        res.json(updatedSupplier);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
const deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found or not authorized' });
        }

        await supplier.deleteOne();
        res.json({ message: 'Supplier removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
};
