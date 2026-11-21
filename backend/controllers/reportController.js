const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// @desc    Get dashboard statistics
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        // Total products
        const totalProducts = await Product.countDocuments({ createdBy: req.user.id });

        // Total stock value
        const products = await Product.find({ createdBy: req.user.id });
        const totalStockValue = products.reduce((sum, product) => {
            const valuationPrice = product.costPrice || product.price || 0;
            return sum + (valuationPrice * product.quantity);
        }, 0);

        // Low stock products
        const lowStockProducts = products.filter(p => p.quantity <= p.lowStockThreshold);

        // Recent transactions (last 10)
        const recentTransactions = await Transaction.find({ performedBy: req.user.id })
            .populate('product', 'name sku')
            .populate('performedBy', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        // Stock IN/OUT for last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const stockInTransactions = await Transaction.find({
            type: 'IN',
            performedBy: req.user.id,
            createdAt: { $gte: sevenDaysAgo }
        });

        const stockOutTransactions = await Transaction.find({
            type: 'OUT',
            performedBy: req.user.id,
            createdAt: { $gte: sevenDaysAgo }
        });

        const stockInTotal = stockInTransactions.reduce((sum, t) => sum + t.quantity, 0);
        const stockOutTotal = stockOutTransactions.reduce((sum, t) => sum + t.quantity, 0);

        res.json({
            totalProducts,
            totalStockValue: totalStockValue.toFixed(2),
            lowStockCount: lowStockProducts.length,
            lowStockProducts: lowStockProducts.slice(0, 5), // Top 5 low stock
            recentTransactions,
            stockMovement: {
                stockIn: stockInTotal,
                stockOut: stockOutTotal,
                period: '7 days'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get inventory report
// @route   GET /api/reports/inventory
// @access  Private
const getInventoryReport = async (req, res) => {
    try {
        const { startDate, endDate, category } = req.query;

        let query = { createdBy: req.user.id };

        if (category) {
            query.category = category;
        }

        const products = await Product.find(query)
            .populate('category', 'name')
            .populate('supplier', 'name')
            .sort({ name: 1 });

        // Get transactions for the period
        let transactionQuery = { performedBy: req.user.id };
        if (startDate && endDate) {
            transactionQuery.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const transactions = await Transaction.find(transactionQuery)
            .populate('product', 'name sku');

        res.json({
            products,
            transactions,
            summary: {
                totalProducts: products.length,
                totalValue: products.reduce((sum, p) => {
                    const valuationPrice = p.costPrice || p.price || 0;
                    return sum + (valuationPrice * p.quantity);
                }, 0),
                totalTransactions: transactions.length
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export report as PDF
// @route   GET /api/reports/export/pdf
// @access  Private
const exportPDF = async (req, res) => {
    try {
        const products = await Product.find({ createdBy: req.user.id })
            .populate('category', 'name')
            .populate('supplier', 'name')
            .sort({ name: 1 });

        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.pdf');

        doc.pipe(res);

        // Title
        doc.fontSize(20).text('Inventory Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(2);

        // Summary
        const totalValue = products.reduce((sum, p) => {
            const valuationPrice = p.costPrice || p.price || 0;
            return sum + (valuationPrice * p.quantity);
        }, 0);
        doc.fontSize(14).text('Summary', { underline: true });
        doc.fontSize(11).text(`Total Products: ${products.length}`);
        doc.text(`Total Stock Value: ₹${totalValue.toFixed(2)}`);
        doc.moveDown(2);

        // Products table
        doc.fontSize(14).text('Product List', { underline: true });
        doc.moveDown();

        doc.fontSize(9);
        products.forEach((product, index) => {
            if (doc.y > 700) {
                doc.addPage();
            }

            doc.text(
                `${index + 1}. ${product.name} | SKU: ${product.sku} | Qty: ${product.quantity} ${product.unit || 'Units'} | Cost: ₹${product.costPrice || product.price} | Category: ${product.category?.name || 'N/A'}`,
                { width: 500 }
            );
            doc.moveDown(0.5);
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export report as Excel
// @route   GET /api/reports/export/excel
// @access  Private
const exportExcel = async (req, res) => {
    try {
        const products = await Product.find({ createdBy: req.user.id })
            .populate('category', 'name')
            .populate('supplier', 'name')
            .sort({ name: 1 });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Inventory Report');

        // Add headers
        worksheet.columns = [
            { header: 'SKU', key: 'sku', width: 15 },
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Category', key: 'category', width: 15 },
            { header: 'Supplier', key: 'supplier', width: 20 },
            { header: 'Quantity', key: 'quantity', width: 10 },
            { header: 'Unit', key: 'unit', width: 10 },
            { header: 'Price (₹)', key: 'price', width: 12 },
            { header: 'Total Value (₹)', key: 'totalValue', width: 15 },
            { header: 'Low Stock', key: 'lowStock', width: 10 }
        ];

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '6366F1' }
        };
        worksheet.getRow(1).font = { color: { argb: 'FFFFFF' }, bold: true };

        // Add data
        products.forEach(product => {
            const valuationPrice = product.costPrice || product.price || 0;
            worksheet.addRow({
                sku: product.sku,
                name: product.name,
                category: product.category?.name || 'N/A',
                supplier: product.supplier?.name || 'N/A',
                quantity: product.quantity,
                unit: product.unit || 'Units',
                price: valuationPrice,
                totalValue: (valuationPrice * product.quantity).toFixed(2),
                lowStock: product.quantity <= product.lowStockThreshold ? 'Yes' : 'No'
            });
        });

        // Add summary at the bottom
        worksheet.addRow({});
        worksheet.addRow({
            name: 'TOTAL',
            totalValue: products.reduce((sum, p) => {
                const valuationPrice = p.costPrice || p.price || 0;
                return sum + (valuationPrice * p.quantity);
            }, 0).toFixed(2)
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getInventoryReport,
    exportPDF,
    exportExcel
};
