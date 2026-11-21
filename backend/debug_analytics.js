require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        const products = await Product.find().limit(20);
        console.log('Products Check:');
        products.forEach(p => {
            console.log(`[${p.name}] Price: ${p.price}, Cost: ${p.costPrice}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
