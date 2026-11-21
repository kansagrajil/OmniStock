const mongoose = require('mongoose');
const XLSX = require('xlsx');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Supplier = require('./models/Supplier');
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

const undoImport = async () => {
    await connectDB();

    try {
        const filePath = 'c:\\Users\\Marshal Borad\\OneDrive\\Desktop\\stockomni\\Vegetable_Inventory_Data.xlsx';

        // 1. Delete Products based on Excel SKUs
        let deletedProducts = 0;
        try {
            const workbook = XLSX.readFile(filePath);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(sheet);

            const skus = data.map(item => item['SKU']).filter(sku => sku);

            if (skus.length > 0) {
                const result = await Product.deleteMany({ sku: { $in: skus } });
                deletedProducts = result.deletedCount;
                console.log(`Deleted ${deletedProducts} imported products.`);
            }
        } catch (err) {
            console.log('Could not read Excel for SKUs (maybe file deleted?), skipping specific SKU deletion.');
            // Fallback: Delete products created today? Too risky. 
            // Or rely on 'address' logic for suppliers.
        }

        // 2. Delete Auto-created Suppliers
        // The import script used address: 'Imported Address'
        const supplierResult = await Supplier.deleteMany({ address: 'Imported Address' });
        console.log(`Deleted ${supplierResult.deletedCount} auto-created suppliers.`);

        // 3. Delete Auto-created Categories
        // The import script used description: 'Auto-created from import'
        const categoryResult = await Category.deleteMany({ description: 'Auto-created from import' });
        console.log(`Deleted ${categoryResult.deletedCount} auto-created categories.`);

        process.exit();
    } catch (error) {
        console.error(`Undo Error: ${error}`);
        process.exit(1);
    }
};

undoImport();
