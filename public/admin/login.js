document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    const errorDiv = document.getElementById('error');

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
    }

    function hideError() {
        errorDiv.classList.remove('show');
    }

    function setLoading(loading) {
        submitBtn.disabled = loading;
        if (loading) {
            submitBtn.innerHTML = '<span class="loading"></span>Signing in...';
        } else {
            submitBtn.innerHTML = 'Sign In';
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();
        setLoading(true);

        const formData = new FormData(form);
        const username = formData.get('username');
        const password = formData.get('password');

        try {
            const response = await fetch('/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Get redirect URL from query params or default to /admin
                const urlParams = new URLSearchParams(window.location.search);
                const next = urlParams.get('next') || '/admin';
                window.location.href = next;
            } else {
                // Handle errors
                if (response.status === 429) {
                    showError('Too many login attempts. Please try again later.');
                } else if (response.status === 401) {
                    showError('Invalid username or password.');
                } else {
                    showError('An error occurred. Please try again.');
                }
                setLoading(false);
            }
        } catch (error) {
            showError('Network error. Please check your connection.');
            setLoading(false);
        }
    });

    // Auto-focus username field
    document.getElementById('username').focus();

});