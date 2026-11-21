// api-v2.js
// Enhanced API connection logic for OmniStock

// Dynamic API_URL detection
const API_URL = (function () {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;

    console.log('[OmniStock] Detecting environment:', { hostname, protocol, port });

    // 1. If on any localhost variant
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') {
        const url = 'http://localhost:5000/api';
        console.log('[OmniStock] Localhost detected. Backend expected at:', url);
        return url;
    }

    // 2. If accessed via LAN IP (e.g. 192.168.x.x)
    if (hostname.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
        const url = `${protocol}//${hostname}:5000/api`;
        console.log('[OmniStock] LAN IP detected. Backend expected at:', url);
        return url;
    }

    // 3. Robust port check
    if (port === '5001') {
        const url = `${protocol}//${hostname}:5000/api`;
        console.log('[OmniStock] Port 5001 detected. Trying backend on port 5000:', url);
        return url;
    }

    // 4. Default fallback: assume backend is at /api on the same host (ideal for ngrok/prod)
    const url = `${protocol}//${hostname}${port ? ':' + port : ''}/api`;
    console.log('[OmniStock] Using default URL mapping:', url);
    return url;
})();

// Helper functions for Token management
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Generic API Request Handler
const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Remove Content-Type for FormData (multer needs boundary)
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    try {
        console.log(`[API Call] ${options.method || 'GET'} ${API_URL}${endpoint}`, options.body ? '\nPayload:' : '', options.body || '');
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            // Handle unauthorized / token expired
            if (response.status === 401) {
                console.warn('[API] Token expired or invalid. Redirecting to login...');
                removeToken();
                if (!window.location.pathname.includes('login.html')) {
                    window.location.href = '/pages/login.html';
                }
            }
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('[API Error]', error);
        throw error;
    }
};

// Defined API Endpoints
const API = {
    auth: {
        login: (creds) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(creds) }),
        register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
        getMe: () => apiRequest('/auth/me'),
        updateDetails: (formData) => apiRequest('/auth/updatedetails', { method: 'PUT', body: formData })
    },
    products: {
        getAll: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return apiRequest(`/products${query ? '?' + query : ''}`);
        },
        getById: (id) => apiRequest(`/products/${id}`),
        create: (formData) => apiRequest('/products', { method: 'POST', body: formData }),
        update: (id, formData) => apiRequest(`/products/${id}`, { method: 'PUT', body: formData }),
        delete: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' }),
        getLowStock: () => apiRequest('/products/low-stock')
    },
    categories: {
        getAll: () => apiRequest('/categories'),
        getById: (id) => apiRequest(`/categories/${id}`),
        create: (data) => apiRequest('/categories', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => apiRequest(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id) => apiRequest(`/categories/${id}`, { method: 'DELETE' })
    },
    suppliers: {
        getAll: () => apiRequest('/suppliers'),
        getById: (id) => apiRequest(`/suppliers/${id}`),
        create: (data) => apiRequest('/suppliers', { method: 'POST', body: data }),
        update: (id, data) => apiRequest(`/suppliers/${id}`, { method: 'PUT', body: data }),
        delete: (id) => apiRequest(`/suppliers/${id}`, { method: 'DELETE' })
    },
    stock: {
        stockIn: (data) => apiRequest('/stock/in', { method: 'POST', body: JSON.stringify(data) }),
        stockOut: (data) => apiRequest('/stock/out', { method: 'POST', body: JSON.stringify(data) }),
        getTransactions: () => apiRequest('/stock/transactions')
    },
    reports: {
        getDashboard: () => apiRequest('/reports/dashboard'),
        getInventory: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return apiRequest(`/reports/inventory${query ? '?' + query : ''}`);
        }
    },
    analytics: {
        getDashboard: (timeframe = 'weekly') => apiRequest(`/analytics/dashboard?timeframe=${timeframe}`)
    },
    users: {
        getAll: () => apiRequest('/users'),
        delete: (id) => apiRequest(`/users/${id}`, { method: 'DELETE' })
    }
};

// Global Exports
window.API = API;
window.getToken = getToken;
window.setToken = setToken;
window.removeToken = removeToken;
window.API_BASE_URL = API_URL;
