require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
const Product = require('./models/Product');
const User = require('./models/User');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stockomni');
        console.log('Connected to DB');

        const totalTxs = await Transaction.countDocuments();
        console.log(`Total transactions in DB: ${totalTxs}`);

        const lastTxs = await Transaction.find().sort({ createdAt: -1 }).limit(5).populate('product');

        lastTxs.forEach((t, i) => {
            console.log(`\nTransaction ${i + 1}:`);
            console.log(`Date: ${t.createdAt}`);
            console.log(`Type: ${t.type}`);
            console.log(`Product: ${t.product?.name || 'N/A'}`);
            console.log(`Quantity: ${t.quantity}`);
            console.log(`UnitPrice: ${t.unitPrice}`);
        });

    } catch (error) {
        console.error('Debug failed:', error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
