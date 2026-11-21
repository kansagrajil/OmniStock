const mongoose = require('mongoose');
const XLSX = require('xlsx');
const Supplier = require('./models/Supplier');
const User = require('./models/User');
const path = require('path');
require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const importData = async () => {
    await connectDB();

    try {
        // 1. Get Admin User
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.error('Error: No admin user found to assign suppliers to.'); // Should not happen in seeded DB
            process.exit(1);
        }
        console.log(`Assigning suppliers to admin: ${adminUser.name} (${adminUser._id})`);

        // 2. Read Excel File
        const filePath = 'c:\\Users\\Marshal Borad\\OneDrive\\Desktop\\stockomni\\Supplier_Data.xlsx';
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        console.log(`Found ${data.length} records in Excel.`);

        // 3. Map and Insert
        const suppliers = data.map(item => ({
            name: item['Supplier Name'] || item['Name'], // Adjust column names based on actual file
            email: item['Email'],
            phone: item['Phone'] || item['Contact'],
            address: item['Address'],
            city: item['City'],
            country: item['Country'],
            createdBy: adminUser._id
        }));

        // Filter out invalid entries if any
        const validSuppliers = suppliers.filter(s => s.name);

        if (validSuppliers.length > 0) {
            await Supplier.insertMany(validSuppliers);
            console.log(`Successfully imported ${validSuppliers.length} suppliers!`);
        } else {
            console.log('No valid supplier data found to import.');
        }

        process.exit();
    } catch (error) {
        console.error(`Error with import: ${error}`);
        process.exit(1);
    }
};

importData();
