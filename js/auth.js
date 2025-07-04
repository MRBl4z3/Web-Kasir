document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');

    // GANTI PASSWORD INI SESUAI KEINGINAN ANDA
    const ADMIN_PASSWORD = "admin123";

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredPassword = passwordInput.value;

        if (enteredPassword === ADMIN_PASSWORD) {
            // Jika password benar, simpan status login di sessionStorage
            // dan alihkan ke halaman dashboard
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            window.location.href = '/admin/dashboard.html';
        } else {
            // Jika salah, tampilkan pesan error
            errorMessage.classList.remove('hidden');
            passwordInput.value = '';
        }
    });
});
