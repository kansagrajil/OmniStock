const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

// @desc    Stock IN operation
// @route   POST /api/stock/in
// @access  Private
const stockIn = async (req, res) => {
    try {
        const { productId, quantity, notes, unitCost } = req.body;

        if (!productId || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Invalid product or quantity' });
        }

        const product = await Product.findOne({
            _id: productId,
            createdBy: req.user._id
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const previousQuantity = product.quantity;
        const addQty = parseInt(quantity);
        product.quantity += addQty;

        if (unitCost) {
            product.costPrice = parseFloat(unitCost);
        }

        await product.save();

        await Transaction.create({
            product: productId,
            type: 'IN',
            quantity: addQty,
            unitPrice: product.costPrice || product.price || 0,
            previousQuantity,
            newQuantity: product.quantity,
            performedBy: req.user._id,
            notes: notes || 'Stock Added'
        });

        const populatedTransaction = await Transaction.findById(transaction._id)
            .populate('product', 'name sku price costPrice')
            .populate('performedBy', 'name email');

        res.status(201).json({
            message: 'Stock added successfully',
            transaction: populatedTransaction,
            product: {
                _id: product._id,
                name: product.name,
                sku: product.sku,
                quantity: product.quantity,
                costPrice: product.costPrice
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Stock OUT operation
// @route   POST /api/stock/out
// @access  Private
const stockOut = async (req, res) => {
    try {
        const { productId, quantity, notes, sellingPrice } = req.body;

        if (!productId || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Invalid product or quantity' });
        }

        const product = await Product.findOne({
            _id: productId,
            createdBy: req.user._id
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.quantity < quantity) {
            return res.status(400).json({ message: `Insufficient stock. Have: ${product.quantity}` });
        }

        const previousQuantity = product.quantity;
        const subQty = parseInt(quantity);
        product.quantity -= subQty;
        await product.save();

        const unitPrice = parseFloat(sellingPrice) || product.price || 0;

        await Transaction.create({
            product: productId,
            type: 'OUT',
            quantity: subQty,
            unitPrice: unitPrice,
            previousQuantity,
            newQuantity: product.quantity,
            performedBy: req.user._id,
            notes: notes || 'Stock Removed'
        });

        const populatedTransaction = await Transaction.findById(transaction._id)
            .populate('product', 'name sku')
            .populate('performedBy', 'name email');

        res.status(201).json({
            message: 'Stock removed successfully',
            transaction: populatedTransaction,
            product: {
                _id: product._id,
                name: product.name,
                sku: product.sku,
                quantity: product.quantity
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all transactions
// @route   GET /api/stock/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const { productId, type, page = 1, limit = 20 } = req.query;

        let query = {
            performedBy: req.user._id
        };

        if (productId) {
            query.product = productId;
        }

        if (type) {
            query.type = type.toUpperCase();
        }

        const skip = (page - 1) * limit;

        const transactions = await Transaction.find(query)
            .populate('product', 'name sku')
            .populate('performedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Transaction.countDocuments(query);

        res.json({
            transactions,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get transactions for a specific product
// @route   GET /api/stock/transactions/:productId
// @access  Private
const getProductTransactions = async (req, res) => {
    try {
        // Verify product ownership first
        const product = await Product.findOne({
            _id: req.params.productId,
            createdBy: req.user.id
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found or not authorized' });
        }

        const transactions = await Transaction.find({ product: req.params.productId })
            .populate('performedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    stockIn,
    stockOut,
    getTransactions,
    getProductTransactions
};
