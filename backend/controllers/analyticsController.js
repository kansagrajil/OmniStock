const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

// @desc    Get dashboard analytics (P&L, Top Products)
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardAnalytics = async (req, res) => {
    try {
        const { timeframe = 'monthly' } = req.query; // weekly, monthly, yearly
        const now = new Date();
        let startDate;
        let labels = [];
        let salesData = [];     // Formerly revenueData
        let purchaseData = [];  // Formerly costData (partially)

        // Map to store aggregated data
        // Keys will be:
        // Weekly/Monthly: Day number (or date string)
        // Yearly: Month number (0-11)
        const dataMap = {};

        // 1. Determine Start Date and Initialize Data Map
        if (timeframe === 'weekly') {
            // Last 7 days
            startDate = new Date();
            startDate.setDate(now.getDate() - 6);
            startDate.setHours(0, 0, 0, 0);

            for (let i = 0; i < 7; i++) {
                const d = new Date(startDate);
                d.setDate(startDate.getDate() + i);
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                const dateKey = d.toDateString();

                labels.push(dayName);
                dataMap[dateKey] = { sales: 0, purchases: 0 };
            }
        } else if (timeframe === 'yearly') {
            // This Year
            startDate = new Date(now.getFullYear(), 0, 1);

            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            labels = months;

            for (let i = 0; i < 12; i++) {
                dataMap[i] = { sales: 0, purchases: 0 };
            }
        } else {
            // Monthly
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

            for (let i = 1; i <= daysInMonth; i++) {
                labels.push(i);
                dataMap[i] = { sales: 0, purchases: 0 };
            }
        }

        // 2. Fetch Transactions (User Isolated)
        const transactions = await Transaction.find({
            createdAt: { $gte: startDate },
            performedBy: req.user.id
        }).populate('product', 'price costPrice name');

        // 3. Aggregate Data & Calculate Today's Stats
        let todaySales = 0;
        let todayPurchases = 0;
        let todayProfit = 0;
        const todayKey = now.toDateString();

        transactions.forEach(t => {
            const tDate = new Date(t.createdAt);
            const tDateString = tDate.toDateString(); // For today check
            let key;

            if (timeframe === 'weekly') {
                key = tDate.toDateString();
            } else if (timeframe === 'yearly') {
                key = tDate.getMonth();
            } else {
                key = tDate.getDate();
            }

            const product = t.product;
            if (product && dataMap[key]) {
                // Ensure costPrice and price have fallbacks
                const pPrice = product.price || 0;
                const pCostPrice = product.costPrice !== undefined ? product.costPrice : 0;

                // Priority for price: 
                // 1. Transaction unitPrice (New)
                // 2. Product costPrice/price (Fallback for old transactions)
                let priceToUse;
                if (t.type === 'OUT') {
                    priceToUse = t.unitPrice || pPrice || pCostPrice || 0;
                } else {
                    priceToUse = t.unitPrice || pCostPrice || pPrice || 0;
                }

                const totalValue = t.quantity * priceToUse;

                if (t.type === 'OUT') {
                    // Sales
                    dataMap[key].sales += totalValue;

                    // Calculate Profit for this transaction (Gross Profit)
                    // For profit, we really need the cost price at that time.
                    // If t.unitPrice exists for OUT, it's the selling price.
                    // We still need the costPrice for profit calculation.
                    const costPriceForProfit = pCostPrice || pPrice || 0;
                    const transactionCost = t.quantity * costPriceForProfit;
                    const transactionProfit = totalValue - transactionCost;

                    // Initialize profit in map if not exists
                    if (!dataMap[key].profit) dataMap[key].profit = 0;
                    dataMap[key].profit += transactionProfit;

                    if (tDateString === todayKey) {
                        todaySales += totalValue;
                        todayProfit += transactionProfit;
                    }
                } else if (t.type === 'IN') {
                    // Purchases
                    dataMap[key].purchases += totalValue;
                    if (tDateString === todayKey) todayPurchases += totalValue;
                }
            }
        });

        // 4. Flatten Data
        let profitData = [];
        if (timeframe === 'weekly') {
            const tempDate = new Date(startDate);
            for (let i = 0; i < 7; i++) {
                const dateKey = tempDate.toDateString();
                salesData.push(dataMap[dateKey].sales);
                purchaseData.push(dataMap[dateKey].purchases);
                profitData.push(dataMap[dateKey].profit || 0);
                tempDate.setDate(tempDate.getDate() + 1);
            }
        } else if (timeframe === 'yearly') {
            for (let i = 0; i < 12; i++) {
                salesData.push(dataMap[i].sales);
                purchaseData.push(dataMap[i].purchases);
                profitData.push(dataMap[i].profit || 0);
            }
        } else {
            // Monthly
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                salesData.push(dataMap[i].sales);
                purchaseData.push(dataMap[i].purchases);
                profitData.push(dataMap[i].profit || 0);
            }
        }

        // 5. Top Products (User Isolated & Timeframe Filtered)
        const productPerformance = await Transaction.aggregate([
            {
                $match: {
                    type: 'OUT',
                    performedBy: req.user._id,
                    createdAt: { $gte: startDate } // Apply timeframe filter
                }
            },
            { $group: { _id: '$product', totalSold: { $sum: '$quantity' } } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
            { $unwind: '$product' },
            { $project: { name: '$product.name', totalSold: 1, currentStock: '$product.quantity' } }
        ]);

        res.json({
            graph: {
                labels,
                sales: salesData,
                purchases: purchaseData,
                profit: profitData
            },
            today: {
                sales: todaySales,
                purchases: todayPurchases,
                profit: todayProfit
            },
            topProducts: productPerformance
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardAnalytics
};
