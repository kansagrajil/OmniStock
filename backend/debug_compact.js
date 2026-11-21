require('dotenv').config();
const mongoose = require('mongoose');
require('./models/User');
require('./models/Category');
const Product = require('./models/Product');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stockomni');
        const products = await Product.find().populate('createdBy');
        products.forEach(p => {
            const val = p.quantity * (p.costPrice || p.price || 0);
            if (p.quantity === 50 || val === 5000) {
                console.log(`MATCH: ${p.name} | Qty: ${p.quantity} | Val: ${val} | User: ${p.createdBy?.name}`);
            }
        });
    } catch (e) { console.error(e); } finally { await mongoose.disconnect(); }
};
run();
