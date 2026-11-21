// auth.js - Version 1.1 (Fixed Redirection)
// Check if user is authenticated
const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/login.html';
        return false;
    }
    return true;
};

// Get current user from localStorage
const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

// Save user to localStorage
const saveUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
};

// Logout function
const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
};

// Check if user is admin
const isAdmin = () => {
    const user = getCurrentUser();
    return user && user.role === 'admin';
};

// Show/hide elements based on role
const setupRoleBasedUI = () => {
    const adminOnly = document.querySelectorAll('[data-admin-only]');
    if (!isAdmin()) {
        adminOnly.forEach(el => el.style.display = 'none');
    }
};

// Export functions
window.checkAuth = checkAuth;
window.getCurrentUser = getCurrentUser;
window.saveUser = saveUser;
window.logout = logout;
window.isAdmin = isAdmin;
window.setupRoleBasedUI = setupRoleBasedUI;
