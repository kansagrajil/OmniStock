require('dotenv').config();
const mongoose = require('mongoose');
require('./models/User');
require('./models/Category');
const Product = require('./models/Product');
const User = mongoose.model('User');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stockomni');
        console.log('Connected to DB');

        const marsh = await User.findOne({ name: 'marsh' });
        if (!marsh) { console.log('User marsh not found'); return; }

        const products = await Product.find({ createdBy: marsh._id }).populate('category');
        console.log(`Found ${products.length} products for marsh.`);

        products.forEach(p => {
            console.log(`\nProduct: ${p.name}`);
            console.log(`Quantity: ${p.quantity}`);
            console.log(`Price: ${p.price}`);
            console.log(`Cost Price: ${p.costPrice}`);
            console.log(`Stock Value (Selling): ${p.quantity * p.price}`);
            console.log(`Stock Value (Cost): ${p.quantity * p.costPrice}`);
        });

    } catch (error) {
        console.error('Debug failed:', error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
