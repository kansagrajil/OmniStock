// Data Storage
let stockData = JSON.parse(localStorage.getItem('stockData')) || [];
let itemData = JSON.parse(localStorage.getItem('itemData')) || [];
let salesData = JSON.parse(localStorage.getItem('salesData')) || [];
let currentEditId = null;

// Charts
let salesChart = null;
let categoryChart = null;

// Initialize App
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    setupEventListeners();
    loadAllData();
    initializeCharts();
    checkReminders();
    setTodayDate();
});

// Initialize Application
function initializeApp() {
    // Add sample data if empty (for demo purposes)
    if (stockData.length === 0) {
        addSampleData();
    }
}

// Add Sample Data
function addSampleData() {
    const sampleStock = [
        { id: Date.now() + 1, name: 'Laptop Dell XPS 15', category: 'Electronics', quantity: 15, price: 1299.99, reorderLevel: 5 },
        { id: Date.now() + 2, name: 'Office Chair', category: 'Furniture', quantity: 8, price: 249.99, reorderLevel: 3 },
        { id: Date.now() + 3, name: 'Wireless Mouse', category: 'Electronics', quantity: 2, price: 29.99, reorderLevel: 10 },
        { id: Date.now() + 4, name: 'Notebook A4', category: 'Stationery', quantity: 50, price: 3.99, reorderLevel: 20 }
    ];

    const sampleItems = [
        { id: Date.now() + 1, sku: 'DELL-XPS-15', name: 'Laptop Dell XPS 15', category: 'Electronics', description: 'High-performance laptop', supplier: 'Dell Inc.' },
        { id: Date.now() + 2, sku: 'CHAIR-001', name: 'Office Chair', category: 'Furniture', description: 'Ergonomic office chair', supplier: 'Office Supplies Co.' },
        { id: Date.now() + 3, sku: 'MOUSE-WL-01', name: 'Wireless Mouse', category: 'Electronics', description: 'Bluetooth wireless mouse', supplier: 'Tech Accessories' },
        { id: Date.now() + 4, sku: 'NOTE-A4-001', name: 'Notebook A4', category: 'Stationery', description: '200 pages ruled notebook', supplier: 'Paper Products Ltd.' }
    ];

    stockData = sampleStock;
    itemData = sampleItems;
    saveToLocalStorage();
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function () {
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });

    // Mobile menu
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
        });
    }

    if (closeSidebar) {
        closeSidebar.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }

    // Search functionality
    document.getElementById('stockSearch')?.addEventListener('input', (e) => filterTable('stock', e.target.value));
    document.getElementById('itemSearch')?.addEventListener('input', (e) => filterTable('items', e.target.value));
    document.getElementById('salesSearch')?.addEventListener('input', (e) => filterTable('sales', e.target.value));

    // Date filters for sales
    document.getElementById('salesDateFrom')?.addEventListener('change', filterSalesByDate);
    document.getElementById('salesDateTo')?.addEventListener('change', filterSalesByDate);
}

// Switch Section
function switchSection(section) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(section).classList.add('active');

    // Close mobile menu
    document.getElementById('sidebar').classList.remove('active');

    // Refresh data for the section
    if (section === 'dashboard') {
        updateDashboard();
    }
}

// Load All Data
function loadAllData() {
    loadStockTable();
    loadItemTable();
    loadSalesTable();
    updateDashboard();
    populateSaleItemDropdown();
}

// Save to LocalStorage
function saveToLocalStorage() {
    localStorage.setItem('stockData', JSON.stringify(stockData));
    localStorage.setItem('itemData', JSON.stringify(itemData));
    localStorage.setItem('salesData', JSON.stringify(salesData));
}

// ==================== STOCK MANAGEMENT ====================

function openStockModal(id = null) {
    currentEditId = id;
    const modal = document.getElementById('stockModal');
    const title = document.getElementById('stockModalTitle');

    if (id) {
        title.textContent = 'Edit Stock';
        const stock = stockData.find(s => s.id === id);
        if (stock) {
            document.getElementById('stockId').value = stock.id;
            document.getElementById('stockName').value = stock.name;
            document.getElementById('stockCategory').value = stock.category;
            document.getElementById('stockQuantity').value = stock.quantity;
            document.getElementById('stockPrice').value = stock.price;
            document.getElementById('stockReorderLevel').value = stock.reorderLevel;
        }
    } else {
        title.textContent = 'Add Stock';
        document.getElementById('stockForm').reset();
        document.getElementById('stockId').value = '';
    }
}

function saveStock() {
    const form = document.getElementById('stockForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('stockId').value;
    const stockItem = {
        id: id ? parseInt(id) : Date.now(),
        name: document.getElementById('stockName').value,
        category: document.getElementById('stockCategory').value,
        quantity: parseInt(document.getElementById('stockQuantity').value),
        price: parseFloat(document.getElementById('stockPrice').value),
        reorderLevel: parseInt(document.getElementById('stockReorderLevel').value)
    };

    if (id) {
        const index = stockData.findIndex(s => s.id === parseInt(id));
        stockData[index] = stockItem;
        showToast('Stock updated successfully!');
    } else {
        stockData.push(stockItem);
        showToast('Stock added successfully!');
    }

    saveToLocalStorage();
    loadStockTable();
    updateDashboard();
    checkReminders();

    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('stockModal')).hide();
}

function loadStockTable() {
    const tbody = document.getElementById('stockTableBody');

    if (stockData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No stock items found</td></tr>';
        return;
    }

    tbody.innerHTML = stockData.map(stock => {
        const status = getStockStatus(stock.quantity, stock.reorderLevel);
        return `
            <tr>
                <td><strong>${stock.name}</strong></td>
                <td>${stock.category}</td>
                <td>${stock.quantity}</td>
                <td>$${stock.price.toFixed(2)}</td>
                <td>${stock.reorderLevel}</td>
                <td><span class="status-badge status-${status.class}">${status.text}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary btn-icon" onclick="openStockModal(${stock.id})" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger btn-icon" onclick="deleteStock(${stock.id})" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function deleteStock(id) {
    if (confirm('Are you sure you want to delete this stock item?')) {
        stockData = stockData.filter(s => s.id !== id);
        saveToLocalStorage();
        loadStockTable();
        updateDashboard();
        showToast('Stock deleted successfully!');
    }
}

function getStockStatus(quantity, reorderLevel) {
    if (quantity > reorderLevel * 2) {
        return { class: 'high', text: 'In Stock' };
    } else if (quantity > reorderLevel) {
        return { class: 'medium', text: 'Medium' };
    } else {
        return { class: 'low', text: 'Low Stock' };
    }
}

// ==================== ITEM MANAGEMENT ====================

function openItemModal(id = null) {
    currentEditId = id;
    const modal = document.getElementById('itemModal');
    const title = document.getElementById('itemModalTitle');

    if (id) {
        title.textContent = 'Edit Item';
        const item = itemData.find(i => i.id === id);
        if (item) {
            document.getElementById('itemId').value = item.id;
            document.getElementById('itemSKU').value = item.sku;
            document.getElementById('itemName').value = item.name;
            document.getElementById('itemCategory').value = item.category;
            document.getElementById('itemDescription').value = item.description || '';
            document.getElementById('itemSupplier').value = item.supplier || '';
        }
    } else {
        title.textContent = 'Add Item';
        document.getElementById('itemForm').reset();
        document.getElementById('itemId').value = '';
    }
}

function saveItem() {
    const form = document.getElementById('itemForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('itemId').value;
    const item = {
        id: id ? parseInt(id) : Date.now(),
        sku: document.getElementById('itemSKU').value,
        name: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value,
        description: document.getElementById('itemDescription').value,
        supplier: document.getElementById('itemSupplier').value
    };

    if (id) {
        const index = itemData.findIndex(i => i.id === parseInt(id));
        itemData[index] = item;
        showToast('Item updated successfully!');
    } else {
        itemData.push(item);
        showToast('Item added successfully!');
    }

    saveToLocalStorage();
    loadItemTable();
    populateSaleItemDropdown();

    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('itemModal')).hide();
}

function loadItemTable() {
    const tbody = document.getElementById('itemTableBody');

    if (itemData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No items found</td></tr>';
        return;
    }

    tbody.innerHTML = itemData.map(item => `
        <tr>
            <td><code>${item.sku}</code></td>
            <td><strong>${item.name}</strong></td>
            <td>${item.category}</td>
            <td>${item.description || '-'}</td>
            <td>${item.supplier || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary btn-icon" onclick="openItemModal(${item.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-icon" onclick="deleteItem(${item.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        itemData = itemData.filter(i => i.id !== id);
        saveToLocalStorage();
        loadItemTable();
        populateSaleItemDropdown();
        showToast('Item deleted successfully!');
    }
}

// ==================== SALES MANAGEMENT ====================

function openSalesModal() {
    document.getElementById('salesForm').reset();
    setTodayDate();
    populateSaleItemDropdown();
}

function populateSaleItemDropdown() {
    const select = document.getElementById('saleItem');
    if (!select) return;

    select.innerHTML = '<option value="">Choose an item...</option>' +
        stockData.map(stock =>
            `<option value="${stock.id}" data-price="${stock.price}" data-quantity="${stock.quantity}">
                ${stock.name} (Available: ${stock.quantity})
            </option>`
        ).join('');
}

function updateSalePrice() {
    const select = document.getElementById('saleItem');
    const selectedOption = select.options[select.selectedIndex];
    const price = selectedOption.getAttribute('data-price');

    if (price) {
        document.getElementById('salePrice').value = price;
        calculateTotal();
    }
}

function calculateTotal() {
    const quantity = parseFloat(document.getElementById('saleQuantity').value) || 0;
    const price = parseFloat(document.getElementById('salePrice').value) || 0;
    const total = quantity * price;

    document.getElementById('saleTotal').value = '$' + total.toFixed(2);
}

function saveSale() {
    const form = document.getElementById('salesForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const itemId = parseInt(document.getElementById('saleItem').value);
    const quantity = parseInt(document.getElementById('saleQuantity').value);
    const price = parseFloat(document.getElementById('salePrice').value);
    const date = document.getElementById('saleDate').value;

    // Check stock availability
    const stockItem = stockData.find(s => s.id === itemId);
    if (!stockItem) {
        alert('Item not found in stock!');
        return;
    }

    if (stockItem.quantity < quantity) {
        alert(`Insufficient stock! Only ${stockItem.quantity} units available.`);
        return;
    }

    // Create sale record
    const sale = {
        id: Date.now(),
        itemId: itemId,
        itemName: stockItem.name,
        quantity: quantity,
        price: price,
        total: quantity * price,
        date: date,
        invoice: 'INV-' + Date.now().toString().slice(-6)
    };

    salesData.push(sale);

    // Update stock quantity
    stockItem.quantity -= quantity;

    saveToLocalStorage();
    loadSalesTable();
    loadStockTable();
    updateDashboard();
    checkReminders();

    showToast('Sale completed successfully!');
    bootstrap.Modal.getInstance(document.getElementById('salesModal')).hide();
}

function loadSalesTable() {
    const tbody = document.getElementById('salesTableBody');

    if (salesData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No sales records found</td></tr>';
        return;
    }

    const sortedSales = [...salesData].sort((a, b) => new Date(b.date) - new Date(a.date));

    tbody.innerHTML = sortedSales.map(sale => `
        <tr>
            <td>${formatDate(sale.date)}</td>
            <td><code>${sale.invoice}</code></td>
            <td>${sale.itemName}</td>
            <td>${sale.quantity}</td>
            <td>$${sale.price.toFixed(2)}</td>
            <td><strong>$${sale.total.toFixed(2)}</strong></td>
            <td>
                <button class="btn btn-sm btn-danger btn-icon" onclick="deleteSale(${sale.id})" title="Delete">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function deleteSale(id) {
    if (confirm('Are you sure you want to delete this sale?')) {
        const sale = salesData.find(s => s.id === id);

        // Restore stock quantity
        const stockItem = stockData.find(s => s.id === sale.itemId);
        if (stockItem) {
            stockItem.quantity += sale.quantity;
        }

        salesData = salesData.filter(s => s.id !== id);
        saveToLocalStorage();
        loadSalesTable();
        loadStockTable();
        updateDashboard();
        showToast('Sale deleted successfully!');
    }
}

function filterSalesByDate() {
    const dateFrom = document.getElementById('salesDateFrom').value;
    const dateTo = document.getElementById('salesDateTo').value;

    let filtered = salesData;

    if (dateFrom) {
        filtered = filtered.filter(s => s.date >= dateFrom);
    }

    if (dateTo) {
        filtered = filtered.filter(s => s.date <= dateTo);
    }

    // Update table with filtered data
    const tbody = document.getElementById('salesTableBody');
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No sales found for selected dates</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(sale => `
        <tr>
            <td>${formatDate(sale.date)}</td>
            <td><code>${sale.invoice}</code></td>
            <td>${sale.itemName}</td>
            <td>${sale.quantity}</td>
            <td>$${sale.price.toFixed(2)}</td>
            <td><strong>$${sale.total.toFixed(2)}</strong></td>
            <td>
                <button class="btn btn-sm btn-danger btn-icon" onclick="deleteSale(${sale.id})" title="Delete">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ==================== DASHBOARD ====================

function updateDashboard() {
    // Update statistics
    document.getElementById('totalItems').textContent = stockData.length;
    document.getElementById('totalSales').textContent = salesData.length;

    const lowStockItems = stockData.filter(s => s.quantity <= s.reorderLevel);
    document.getElementById('lowStockCount').textContent = lowStockItems.length;

    const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total, 0);
    document.getElementById('totalRevenue').textContent = '$' + totalRevenue.toFixed(2);

    // Update recent sales
    updateRecentSales();

    // Update low stock alerts
    updateLowStockAlerts();

    // Update charts
    updateCharts();
}

function updateRecentSales() {
    const container = document.getElementById('recentSales');
    const recentSales = [...salesData].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    if (recentSales.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No recent sales</p>';
        return;
    }

    container.innerHTML = recentSales.map(sale => `
        <div class="activity-item">
            <div>
                <strong>${sale.itemName}</strong><br>
                <small>${sale.quantity} units × $${sale.price.toFixed(2)} = $${sale.total.toFixed(2)}</small><br>
                <small class="text-muted">${formatDate(sale.date)}</small>
            </div>
        </div>
    `).join('');
}

function updateLowStockAlerts() {
    const container = document.getElementById('lowStockAlerts');
    const lowStockItems = stockData.filter(s => s.quantity <= s.reorderLevel);

    if (lowStockItems.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No alerts</p>';
        return;
    }

    container.innerHTML = lowStockItems.map(stock => `
        <div class="alert-item ${stock.quantity === 0 ? 'danger' : ''}">
            <div>
                <strong>${stock.name}</strong><br>
                <small>Current: ${stock.quantity} | Reorder Level: ${stock.reorderLevel}</small>
            </div>
            <i class="bi bi-exclamation-triangle text-warning" style="font-size: 1.5rem;"></i>
        </div>
    `).join('');
}

// ==================== REMINDERS ====================

function checkReminders() {
    const lowStockItems = stockData.filter(s => s.quantity <= s.reorderLevel);

    // Update badges
    document.getElementById('lowStockBadge').textContent = lowStockItems.length;
    document.getElementById('reminderBadge').textContent = lowStockItems.length;

    // Update reminder section
    updateReminderSection();
}

function updateReminderSection() {
    const container = document.getElementById('reminderLowStock');
    const lowStockItems = stockData.filter(s => s.quantity <= s.reorderLevel);

    if (lowStockItems.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No low stock alerts</p>';
        return;
    }

    container.innerHTML = lowStockItems.map(stock => `
        <div class="alert-item ${stock.quantity === 0 ? 'danger' : ''}">
            <div>
                <strong>${stock.name}</strong><br>
                <small>Category: ${stock.category}</small><br>
                <small>Current Stock: <strong>${stock.quantity}</strong> | Reorder Level: ${stock.reorderLevel}</small>
            </div>
            <button class="btn btn-sm btn-primary" onclick="openStockModal(${stock.id})">
                <i class="bi bi-pencil"></i> Update
            </button>
        </div>
    `).join('');
}

function checkAllReminders() {
    checkReminders();
    showToast('Reminders refreshed!');
}

// ==================== CHARTS ====================

function initializeCharts() {
    // Sales Trend Chart
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
        salesChart = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Sales Revenue',
                    data: [],
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    // Category Chart
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        categoryChart = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#6366f1',
                        '#8b5cf6',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#3b82f6'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateCharts();
}

function updateCharts() {
    // Update Sales Chart
    if (salesChart) {
        const last7Days = getLast7Days();
        const salesByDay = last7Days.map(date => {
            const daySales = salesData.filter(s => s.date === date);
            return daySales.reduce((sum, sale) => sum + sale.total, 0);
        });

        salesChart.data.labels = last7Days.map(date => formatDate(date));
        salesChart.data.datasets[0].data = salesByDay;
        salesChart.update();
    }

    // Update Category Chart
    if (categoryChart) {
        const categories = {};
        stockData.forEach(stock => {
            categories[stock.category] = (categories[stock.category] || 0) + stock.quantity;
        });

        categoryChart.data.labels = Object.keys(categories);
        categoryChart.data.datasets[0].data = Object.values(categories);
        categoryChart.update();
    }
}

function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
    }
    return days;
}

// ==================== UTILITY FUNCTIONS ====================

function filterTable(type, searchTerm) {
    const term = searchTerm.toLowerCase();
    let data = [];

    if (type === 'stock') data = stockData;
    else if (type === 'items') data = itemData;
    else if (type === 'sales') data = salesData;

    const filtered = data.filter(item => {
        return Object.values(item).some(value =>
            String(value).toLowerCase().includes(term)
        );
    });

    // Update respective table
    if (type === 'stock') {
        const tbody = document.getElementById('stockTableBody');
        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No results found</td></tr>';
        } else {
            tbody.innerHTML = filtered.map(stock => {
                const status = getStockStatus(stock.quantity, stock.reorderLevel);
                return `
                    <tr>
                        <td><strong>${stock.name}</strong></td>
                        <td>${stock.category}</td>
                        <td>${stock.quantity}</td>
                        <td>$${stock.price.toFixed(2)}</td>
                        <td>${stock.reorderLevel}</td>
                        <td><span class="status-badge status-${status.class}">${status.text}</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-primary btn-icon" onclick="openStockModal(${stock.id})">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-danger btn-icon" onclick="deleteStock(${stock.id})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('saleDate');
    if (dateInput) {
        dateInput.value = today;
    }
}

function showToast(message) {
    const toast = document.getElementById('alertToast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;

    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}
