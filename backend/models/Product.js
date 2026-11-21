const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true
    },
    sku: {
        type: String,
        required: [true, 'Please add a SKU'],
        trim: true,
        uppercase: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Please add a category']
    },
    unit: {
        type: String,
        default: 'Units',
        trim: true
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier'
    },
    quantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    price: {
        type: Number,
        required: [true, 'Please add a selling price'],
        min: 0
    },
    costPrice: {
        type: Number,
        required: [true, 'Please add a cost price'],
        default: 0,
        min: 0
    },
    description: {
        type: String,
        trim: true
    },
    expiryDate: {
        type: Date
    },
    image: {
        type: String,
        default: 'default-product.png'
    },
    lowStockThreshold: {
        type: Number,
        default: 10,
        min: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Virtual for low stock status
productSchema.virtual('isLowStock').get(function () {
    return this.quantity <= this.lowStockThreshold;
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
