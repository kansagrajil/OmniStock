/**
 * common.js - Reusable UI components and utilities for OmniStock
 */

// Toast Notification System
const Toast = {
    show(message, type = 'info', duration = 3000) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000;';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `alert alert-${type}`;
        toast.style.minWidth = '250px';
        toast.style.boxShadow = 'var(--shadow-lg)';

        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'danger') icon = 'exclamation-circle';
        if (type === 'warning') icon = 'exclamation-triangle';

        toast.innerHTML = `
            <i class="bi bi-${icon}"></i>
            <div>${message}</div>
        `;

        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },
    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'danger'); },
    warning(msg) { this.show(msg, 'warning'); },
    info(msg) { this.show(msg, 'info'); }
};

// Loading Spinner Overlay
const Loader = {
    show() {
        if (document.getElementById('loader-overlay')) return;
        const loader = document.createElement('div');
        loader.id = 'loader-overlay';
        loader.className = 'loading-overlay';
        loader.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(loader);
    },
    hide() {
        const loader = document.getElementById('loader-overlay');
        if (loader) loader.remove();
    }
};

// Confirmation Modal
const Confirm = {
    show(title, message, onConfirm) {
        const id = 'confirm-modal-' + Date.now();
        const modalHtml = `
            <div class="modal-overlay" id="${id}">
                <div class="modal">
                    <div class="modal-header">
                        <h5 class="mb-0">${title}</h5>
                        <button class="modal-close" onclick="document.getElementById('${id}').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="document.getElementById('${id}').remove()">Cancel</button>
                        <button class="btn btn-danger" id="confirm-btn-${id}">Confirm</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById(`confirm-btn-${id}`).onclick = () => {
            document.getElementById(id).remove();
            if (onConfirm) onConfirm();
        };
    }
};

// Sidebar Loader
function renderSidebar(activePage = 'dashboard') {
    const user = getCurrentUser();
    if (!user) return;

    const sidebarHtml = `
        <div class="sidebar-header" style="background: var(--surface);">
            <div class="brand-icon">
                <img src="../assets/images/logo.svg" alt="OmniStock Logo" style="width: 40px; height: 40px; object-fit: contain;">
            </div>
            <div>
                <h4 class="mb-0" style="font-weight: 800; font-size: 1.25rem; color: var(--text-primary);">OmniStock</h4>
                <p class="text-muted small mb-0">${user.name}</p>
            </div>
        </div>
        <div class="nav-menu">
            <a class="nav-link ${activePage === 'dashboard' ? 'active' : ''}" href="/pages/dashboard.html">
                <i class="bi bi-speedometer2"></i> Dashboard
            </a>
            <a class="nav-link ${activePage === 'products' ? 'active' : ''}" href="/pages/products.html">
                <i class="bi bi-box"></i> Products
            </a>
            <a class="nav-link ${activePage === 'categories' ? 'active' : ''}" href="/pages/categories.html">
                <i class="bi bi-tags"></i> Categories
            </a>
            <a class="nav-link ${activePage === 'suppliers' ? 'active' : ''}" href="/pages/suppliers.html">
                <i class="bi bi-people"></i> Suppliers
            </a>
            <a class="nav-link ${activePage === 'stock' ? 'active' : ''}" href="/pages/stock.html">
                <i class="bi bi-arrow-left-right"></i> Operations
            </a>
            <a class="nav-link ${activePage === 'reports' ? 'active' : ''}" href="/pages/reports.html">
                <i class="bi bi-file-earmark-text"></i> Reports
            </a>
            ${isAdmin() ? `
            <a class="nav-link ${activePage === 'users' ? 'active' : ''}" href="/pages/users.html">
                <i class="bi bi-shield-check"></i> Users
            </a>
            ` : ''}
            <div style="margin-top: auto; padding-top: 2rem;">
                <a class="nav-link ${activePage === 'sub-profile' ? 'active' : ''}" href="/pages/profile.html">
                    <i class="bi bi-person-circle"></i> My Profile
                </a>
                <a class="nav-link text-danger" href="javascript:void(0)" onclick="handleLogout()">
                    <i class="bi bi-box-arrow-right"></i> Logout
                </a>
            </div>
        </div>
    `;

    const sidebarEl = document.querySelector('.sidebar');
    if (sidebarEl) sidebarEl.innerHTML = sidebarHtml;

    // Initialize Mobile Toggle Logic (since sidebar is rendered dynamically)
    const toggleBtn = document.getElementById('menuToggle');
    const overlay = document.getElementById('sidebarOverlay');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebarEl.classList.toggle('active');
            if (overlay) overlay.classList.toggle('active');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebarEl.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
}

// Global Logout Handler
function handleLogout() {
    Confirm.show('Logout', 'Are you sure you want to logout?', () => {
        logout();
    });
}

// Date Formatter
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Currency Formatter
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount || 0);
}


