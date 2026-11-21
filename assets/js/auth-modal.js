/**
 * auth-modal.js
 * Handles the login/registration modal on the landing page.
 */

const authModal = {
    overlay: null,
    tabs: null,
    forms: null,

    init() {
        this.overlay = document.getElementById('authModalOverlay');
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');

        if (!this.overlay || !loginTab || !registerTab) return;

        // Tab Switching Logic
        loginTab.addEventListener('click', () => this.switchTab('login'));
        registerTab.addEventListener('click', () => this.switchTab('register'));

        // Close logic
        const closeBtn = document.getElementById('closeAuthModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        // Form Submissions
        this.setupForms();
    },

    open(view = 'login') {
        if (!this.overlay) this.init();
        this.overlay.classList.add('active');
        this.switchTab(view);
        document.body.style.overflow = 'hidden'; // Prevent scroll
    },

    close() {
        if (!this.overlay) return;
        this.overlay.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scroll
    },

    switchTab(view) {
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');
        const loginForm = document.getElementById('loginFormModal');
        const registerForm = document.getElementById('registerFormModal');

        if (view === 'login') {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.add('d-none');
            registerForm.classList.remove('active');
            loginForm.classList.remove('d-none');
        } else {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.classList.add('active');
            loginForm.classList.add('d-none');
            loginForm.classList.remove('active');
            registerForm.classList.remove('d-none');
        }
    },

    async setupForms() {
        const loginForm = document.getElementById('loginFormModal');
        const registerForm = document.getElementById('registerFormModal');

        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = loginForm.querySelector('[name="email"]').value;
                const password = loginForm.querySelector('[name="password"]').value;
                const btn = loginForm.querySelector('button');
                const btnText = btn.innerText;

                try {
                    btn.disabled = true;
                    btn.innerText = 'Signing In...';

                    const response = await window.API.auth.login({ email, password });
                    window.setToken(response.token);
                    // Backend returns user data at top level, not nested under 'user'
                    window.saveUser(response);

                    window.location.href = '/pages/dashboard.html';
                } catch (error) {
                    alert(error.message || 'Login failed');
                    btn.disabled = false;
                    btn.innerText = btnText;
                }
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = registerForm.querySelector('[name="name"]').value;
                const email = registerForm.querySelector('[name="email"]').value;
                const password = registerForm.querySelector('[name="password"]').value;
                const confirmPassword = registerForm.querySelector('[name="confirmPassword"]').value;
                const btn = registerForm.querySelector('button');
                const btnText = btn.innerText;

                if (password !== confirmPassword) {
                    alert('Passwords do not match');
                    return;
                }

                try {
                    btn.disabled = true;
                    btn.innerText = 'Creating Account...';

                    await window.API.auth.register({ name, email, password });
                    alert('Registration successful! Please login.');
                    this.switchTab('login');
                    btn.disabled = false;
                    btn.innerText = btnText;
                } catch (error) {
                    alert(error.message || 'Registration failed');
                    btn.disabled = false;
                    btn.innerText = btnText;
                }
            });
        }
    }
};

// Global accessor
window.openAuthModal = (view) => authModal.open(view);
window.closeAuthModal = () => authModal.close();

// Initialize on load
document.addEventListener('DOMContentLoaded', () => authModal.init());
