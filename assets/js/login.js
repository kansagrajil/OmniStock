// Check if already logged in
if (localStorage.getItem('token')) {
    window.location.href = 'dashboard.html';
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorAlert = document.getElementById('errorAlert');
    const loginBtn = document.getElementById('loginBtn');
    const loginSpinner = document.getElementById('loginSpinner');
    const btnText = loginBtn.querySelector('.btn-text');

    if (!email || !password) {
        errorAlert.textContent = 'Please fill in all fields';
        errorAlert.classList.remove('d-none');
        return;
    }

    // Show loading
    loginBtn.disabled = true;
    btnText.classList.add('d-none');
    loginSpinner.classList.remove('d-none');
    errorAlert.classList.add('d-none');

    try {
        const data = await API.auth.login({ email, password });

        // Save token and user
        setToken(data.token);
        saveUser({
            _id: data._id,
            name: data.name,
            email: data.email,
            role: data.role,
            profilePicture: data.profilePicture
        });

        // Show success message
        console.log('Login successful, redirecting...');
        window.location.href = '/pages/dashboard.html';

    } catch (error) {
        console.error('Login Error:', error);
        errorAlert.textContent = error.message || 'Login failed. Please check your credentials.';
        errorAlert.classList.remove('d-none');
        loginBtn.disabled = false;
        btnText.classList.remove('d-none');
        loginSpinner.classList.add('d-none');
    }
});
