const mongoose = require('mongoose');
require('dotenv').config();

async function test() {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const User = require('./models/User');
        const Category = require('./models/Category');

        const testUser = await User.findOne();
        if (!testUser) {
            console.log('No user found to test with.');
            process.exit(0);
        }

        console.log(`Using user: ${testUser.name} (${testUser._id})`);

        // Try creating a dummy category
        const cat = await Category.create({
            name: 'Test Category ' + Date.now(),
            description: 'Test Description',
            createdBy: testUser._id
        });

        console.log('Successfully created category:', cat._id);

        // Cleanup
        await Category.findByIdAndDelete(cat._id);
        console.log('Successfully deleted test category.');

        process.exit(0);
    } catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    }
}

test();
