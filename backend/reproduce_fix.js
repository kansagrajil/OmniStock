require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
const Product = require('./models/Product');
const User = require('./models/User');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to DB');

        // 1. Get a User
        const user = await User.findOne();
        if (!user) { console.log('No user'); return; }
        console.log(`User: ${user.name}`);

        // 2. Create a Test Product with 0 Cost
        const product = await Product.create({
            name: `TestProd_${Date.now()}`,
            sku: `SKU_${Date.now()}`,
            price: 100,
            costPrice: 0,
            quantity: 0,
            createdBy: user._id,
            category: new mongoose.Types.ObjectId(), // Fake ID
            supplier: new mongoose.Types.ObjectId() // Fake ID
        });
        console.log(`Created Product: ${product.name} (Cost: ${product.costPrice})`);

        // 3. Stock In with Unit Cost 50
        console.log('Performing Stock In with Cost 50...');
        const unitCost = 50;
        const quantity = 10;

        // Emulate stockController logic
        product.quantity += quantity;
        product.costPrice = unitCost;
        await product.save();

        await Transaction.create({
            product: product._id,
            type: 'IN',
            quantity: quantity,
            previousQuantity: 0,
            newQuantity: quantity,
            performedBy: user._id,
            notes: 'Test Stock In'
        });

        // 4. Verify Product Cost
        const updatedProduct = await Product.findById(product._id);
        console.log(`Updated Product Cost: ${updatedProduct.costPrice}`);

        // 5. Verify Analytics Logic (Emulate analyticsController)
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        const txs = await Transaction.find({
            createdAt: { $gte: startDate },
            performedBy: user._id,
            product: product._id
        }).populate('product');

        let totalPurchase = 0;
        txs.forEach(t => {
            const cost = t.product.costPrice;
            const val = t.quantity * cost;
            console.log(`Tx Value: ${t.quantity} * ${cost} = ${val}`);
            totalPurchase += val;
        });

        console.log(`Total Purchase for this product: ${totalPurchase}`);

        // Cleanup
        await Transaction.deleteMany({ product: product._id });
        await Product.deleteOne({ _id: product._id });
        console.log('Cleanup done');

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
