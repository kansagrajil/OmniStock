require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
console.log('Connection string:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('✅ MongoDB Connected Successfully!');
        console.log('Host:', mongoose.connection.host);
        console.log('Database:', mongoose.connection.name);
        process.exit(0);
    })
    .catch((error) => {
        console.log('❌ MongoDB Connection Failed!');
        console.log('Error:', error.message);
        console.log('\nPossible fixes:');
        console.log('1. Make sure MongoDB is running: mongod');
        console.log('2. Check if port 27017 is available');
        console.log('3. Verify MONGO_URI in .env file');
        process.exit(1);
    });
