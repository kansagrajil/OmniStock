const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
    try {
        const { search, category, supplier, lowStock, page = 1, limit = 10 } = req.query;

        // Build query
        let query = {
            createdBy: req.user.id
        };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            query.category = category;
        }

        if (supplier) {
            query.supplier = supplier;
        }

        // Get products
        let productsQuery = Product.find(query)
            .populate('category', 'name')
            .populate('supplier', 'name email')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        // Pagination
        const skip = (page - 1) * limit;
        productsQuery = productsQuery.skip(skip).limit(parseInt(limit));

        const products = await productsQuery;
        const total = await Product.countDocuments(query);

        // Filter low stock if requested
        let filteredProducts = products;
        if (lowStock === 'true') {
            filteredProducts = products.filter(p => p.quantity <= p.lowStockThreshold);
        }

        res.json({
            products: filteredProducts,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        })
            .populate('category', 'name description')
            .populate('supplier', 'name email phone address')
            .populate('createdBy', 'name email');

        if (!product) {
            return res.status(404).json({ message: 'Product not found or not authorized' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { sku, quantity, costPrice, price } = req.body;

        // Check if SKU exists for this user
        const skuExists = await Product.findOne({ sku: sku.trim().toUpperCase(), createdBy: req.user._id });
        if (skuExists) {
            return res.status(400).json({ message: 'SKU already exists for your account' });
        }

        // Clean and prepare product data
        const productData = {
            ...req.body,
            sku: sku.trim().toUpperCase(),
            price: parseFloat(price) || 0,
            costPrice: parseFloat(costPrice) || 0,
            quantity: parseInt(quantity) || 0,
            lowStockThreshold: parseInt(req.body.lowStockThreshold) || 10,
            createdBy: req.user._id
        };

        // Add image if uploaded
        if (req.file) {
            productData.image = req.file.filename;
        }

        console.log('[Product] Creating product with data:', { ...productData, image: !!req.file });
        const product = await Product.create(productData);

        // Record initial stock transaction if quantity > 0
        if (product.quantity > 0) {
            const initialPrice = product.costPrice || product.price || 0;
            await Transaction.create({
                product: product._id,
                type: 'IN',
                quantity: product.quantity,
                unitPrice: initialPrice,
                previousQuantity: 0,
                newQuantity: product.quantity,
                performedBy: req.user._id,
                notes: 'Initial stock on product creation'
            });
        }

        const populatedProduct = await Product.findById(product._id)
            .populate('category', 'name')
            .populate('supplier', 'name')
            .populate('createdBy', 'name');

        res.status(201).json(populatedProduct);
    } catch (error) {
        console.error('[Product Error] Create failed:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found or not authorized' });
        }

        // Check if SKU is taken by another product of the same user
        if (req.body.sku && req.body.sku !== product.sku) {
            const skuExists = await Product.findOne({ sku: req.body.sku, createdBy: req.user.id });
            if (skuExists) {
                return res.status(400).json({ message: 'SKU already exists for your account' });
            }
        }

        // Update fields
        Object.keys(req.body).forEach(key => {
            product[key] = req.body[key];
        });

        // Update image if uploaded
        if (req.file) {
            product.image = req.file.filename;
        }

        const updatedProduct = await product.save();

        const populatedProduct = await Product.findById(updatedProduct._id)
            .populate('category', 'name')
            .populate('supplier', 'name')
            .populate('createdBy', 'name');

        res.json(populatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found or not authorized' });
        }

        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Private
const getLowStockProducts = async (req, res) => {
    try {
        const products = await Product.find({ createdBy: req.user.id })
            .populate('category', 'name')
            .populate('supplier', 'name');

        const lowStockProducts = products.filter(p => p.quantity <= p.lowStockThreshold);

        res.json(lowStockProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts
};
