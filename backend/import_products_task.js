const mongoose = require('mongoose');
const XLSX = require('xlsx');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Supplier = require('./models/Supplier');
const User = require('./models/User');
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
            console.error('Error: No admin user found.');
            process.exit(1);
        }

        // 2. Read Excel
        const filePath = 'c:\\Users\\Marshal Borad\\OneDrive\\Desktop\\stockomni\\Vegetable_Inventory_Data.xlsx';
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);

        console.log(`Found ${data.length} products to import.`);

        let successCount = 0;

        for (const item of data) {
            try {
                // 3. Resolve Category
                let categoryName = item['Category']?.trim() || 'Uncategorized';
                let category = await Category.findOne({ name: { $regex: new RegExp(`^${categoryName}$`, 'i') } });

                if (!category) {
                    category = await Category.create({
                        name: categoryName,
                        description: `Auto-created from import`,
                        createdBy: adminUser._id
                    });
                    console.log(`Created new Category: ${categoryName}`);
                }

                // 4. Resolve Supplier
                let supplierName = item['Supplier']?.trim() || 'Unknown Supplier';
                let supplier = await Supplier.findOne({ name: { $regex: new RegExp(`^${supplierName}$`, 'i') } });

                if (!supplier) {
                    supplier = await Supplier.create({
                        name: supplierName,
                        email: `contact@${supplierName.replace(/\s+/g, '').toLowerCase()}.com`, // Dummy email
                        phone: '000-000-0000',
                        address: 'Imported Address',
                        createdBy: adminUser._id
                    });
                    console.log(`Created new Supplier: ${supplierName}`);
                }

                // 5. Create Product
                const productData = {
                    name: item['Product Name'],
                    sku: item['SKU'],
                    category: category._id,
                    supplier: supplier._id,
                    price: item['Price ($)'],
                    costPrice: (item['Price ($)'] * 0.7).toFixed(2), // Estimate cost price
                    quantity: item['Initial Quantity'],
                    lowStockThreshold: item['Alert Threshold'] || 10,
                    description: item['Description'],
                    createdBy: adminUser._id
                };

                // Check for duplicate SKU
                const existingProduct = await Product.findOne({ sku: productData.sku });
                if (existingProduct) {
                    console.log(`Skipping duplicate SKU: ${productData.sku}`);
                    continue;
                }

                await Product.create(productData);
                successCount++;
                process.stdout.write('.'); // Progress dot

            } catch (err) {
                console.error(`\nFailed to import ${item['Product Name']}: ${err.message}`);
            }
        }

        console.log(`\nImport Complete! Successfully added ${successCount} products.`);
        process.exit();

    } catch (error) {
        console.error(`Script Error: ${error}`);
        process.exit(1);
    }
};

importData();
