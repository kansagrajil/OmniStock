require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany();
        await Category.deleteMany();
        await Supplier.deleteMany();
        await Product.deleteMany();

        console.log('Cleared existing data');

        // Create users - passwords will be hashed by User model's pre-save middleware
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@stockomni.com',
            password: 'admin123',  // Will be hashed automatically
            role: 'admin'
        });

        const staff = await User.create({
            name: 'Staff User',
            email: 'staff@stockomni.com',
            password: 'staff123',  // Will be hashed automatically
            role: 'staff'
        });

        console.log('Users created');

        // Create categories
        const categories = await Category.insertMany([
            { name: 'Electronics', description: 'Electronic devices and accessories', createdBy: admin._id },
            { name: 'Furniture', description: 'Office and home furniture', createdBy: admin._id },
            { name: 'Stationery', description: 'Office supplies and stationery', createdBy: admin._id },
            { name: 'Clothing', description: 'Apparel and accessories', createdBy: admin._id },
            { name: 'Food', description: 'Food and beverages', createdBy: admin._id }
        ]);

        console.log('Categories created');

        // Create suppliers
        const suppliers = await Supplier.insertMany([
            {
                name: 'Tech Supplies Inc.',
                email: 'contact@techsupplies.com',
                phone: '+1-555-0101',
                address: '123 Tech Street',
                city: 'San Francisco',
                country: 'USA',
                createdBy: admin._id
            },
            {
                name: 'Office Furniture Co.',
                email: 'sales@officefurniture.com',
                phone: '+1-555-0102',
                address: '456 Furniture Ave',
                city: 'New York',
                country: 'USA',
                createdBy: admin._id
            },
            {
                name: 'Stationery World',
                email: 'info@stationeryworld.com',
                phone: '+1-555-0103',
                address: '789 Paper Lane',
                city: 'Chicago',
                country: 'USA',
                createdBy: admin._id
            }
        ]);

        console.log('Suppliers created');

        // Create products
        const products = await Product.insertMany([
            {
                name: 'Laptop Dell XPS 15',
                sku: 'DELL-XPS-15',
                category: categories[0]._id,
                supplier: suppliers[0]._id,
                quantity: 15,
                price: 1299.99,
                description: 'High-performance laptop with 16GB RAM and 512GB SSD',
                lowStockThreshold: 5,
                createdBy: admin._id
            },
            {
                name: 'Wireless Mouse Logitech',
                sku: 'LOG-MOUSE-01',
                category: categories[0]._id,
                supplier: suppliers[0]._id,
                quantity: 3,
                price: 29.99,
                description: 'Ergonomic wireless mouse with precision tracking',
                lowStockThreshold: 10,
                createdBy: admin._id
            },
            {
                name: 'Office Chair Executive',
                sku: 'CHAIR-EXEC-01',
                category: categories[1]._id,
                supplier: suppliers[1]._id,
                quantity: 8,
                price: 249.99,
                description: 'Ergonomic executive office chair with lumbar support',
                lowStockThreshold: 3,
                createdBy: admin._id
            },
            {
                name: 'Standing Desk Adjustable',
                sku: 'DESK-STAND-01',
                category: categories[1]._id,
                supplier: suppliers[1]._id,
                quantity: 12,
                price: 499.99,
                description: 'Electric height-adjustable standing desk',
                lowStockThreshold: 5,
                createdBy: admin._id
            },
            {
                name: 'Notebook A4 Pack',
                sku: 'NOTE-A4-PACK',
                category: categories[2]._id,
                supplier: suppliers[2]._id,
                quantity: 50,
                price: 12.99,
                description: 'Pack of 5 A4 ruled notebooks',
                lowStockThreshold: 20,
                createdBy: staff._id
            },
            {
                name: 'Pen Set Professional',
                sku: 'PEN-PRO-SET',
                category: categories[2]._id,
                supplier: suppliers[2]._id,
                quantity: 2,
                price: 24.99,
                description: 'Professional pen set with case',
                lowStockThreshold: 15,
                createdBy: staff._id
            }
        ]);

        console.log('Products created');

        console.log('\n=== Seed Data Summary ===');
        console.log(`Users: ${await User.countDocuments()}`);
        console.log(`Categories: ${await Category.countDocuments()}`);
        console.log(`Suppliers: ${await Supplier.countDocuments()}`);
        console.log(`Products: ${await Product.countDocuments()}`);
        console.log('\n=== Login Credentials ===');
        console.log('Admin: admin@stockomni.com / admin123');
        console.log('Staff: staff@stockomni.com / staff123');
        console.log('\nSeed completed successfully!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
