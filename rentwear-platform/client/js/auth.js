const API_BASE = 'http://localhost:5000';

function showMessage(message, type = 'error') {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) return;
    messageDiv.textContent = message;
    messageDiv.className = type;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Store token in localStorage
function setToken(token) {
    localStorage.setItem('token', token);
}

// Get token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Check if user is logged in
function isLoggedIn() {
    return !!getToken();
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Login function
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            setToken(data.token);
            showMessage('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1000);
        } else {
            showMessage(data.message || 'Login failed');
        }
    } catch (error) {
        showMessage('Network error. Please try again.');
    }
}

// Register function
async function register(name, email, password) {
    try {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            setToken(data.token);
            showMessage('Registration successful!', 'success');
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1000);
        } else {
            showMessage(data.message || 'Registration failed');
        }
    } catch (error) {
        showMessage('Network error. Please try again.');
    }
}

// Get user profile
async function getProfile() {
    try {
        const token = getToken();
        if (!token) return null;

        const response = await fetch(`${API_BASE}/api/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            return await response.json();
        } else {
            logout(); // Token invalid
            return null;
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            login(email, password);
        });
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            register(name, email, password);
        });
    }

    // Check if user is already logged in
    if (isLoggedIn()) {
        updateNavButtons();
    }
});

// Function to update navigation buttons based on login status
function updateNavButtons() {
    const signinBtn = document.getElementById('signin-btn');
    const signupBtn = document.getElementById('signup-btn');
    const profileBtn = document.getElementById('profile-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (isLoggedIn()) {
        if (signinBtn) signinBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (profileBtn) profileBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
        if (signinBtn) signinBtn.style.display = 'inline-block';
        if (signupBtn) signupBtn.style.display = 'inline-block';
        if (profileBtn) profileBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }

    // Fallback for pages without ids: adjust by text content matching
    document.querySelectorAll('.nav-auth button').forEach(btn => {
        if (!btn.id) {
            const text = btn.textContent.trim().toLowerCase();
            if (text === 'sign in' || text === 'sign up') {
                btn.style.display = isLoggedIn() ? 'none' : 'inline-block';
            } else if (text === 'profile' || text === 'logout') {
                btn.style.display = isLoggedIn() ? 'inline-block' : 'none';
            }
        }
    });

    // Update mobile menu buttons to match login status
    const mobileSigninBtn = document.getElementById('mobile-signin-btn');
    const mobileSignupBtn = document.getElementById('mobile-signup-btn');
    const mobileProfileBtn = document.getElementById('mobile-profile-btn');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

    if (mobileSigninBtn || mobileSignupBtn || mobileProfileBtn || mobileLogoutBtn) {
        if (isLoggedIn()) {
            if (mobileSigninBtn) mobileSigninBtn.style.display = 'none';
            if (mobileSignupBtn) mobileSignupBtn.style.display = 'none';
            if (mobileProfileBtn) mobileProfileBtn.style.display = 'inline-block';
            if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'inline-block';
        } else {
            if (mobileSigninBtn) mobileSigninBtn.style.display = 'inline-block';
            if (mobileSignupBtn) mobileSignupBtn.style.display = 'inline-block';
            if (mobileProfileBtn) mobileProfileBtn.style.display = 'none';
            if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'none';
        }
    }
}

// Initialize Mobile Menu
function initMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenuBtn = document.getElementById('closeMenuBtn');

    if (!hamburgerBtn || !mobileMenu) {
        // Retry if elements not found yet
        setTimeout(initMobileMenu, 100);
        return;
    }

    hamburgerBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        hamburgerBtn.classList.toggle('active');
        mobileMenu.classList.toggle('open');
        // Ensure menu is visible when open
        if (mobileMenu.classList.contains('open')) {
            mobileMenu.style.display = 'flex';
        }
    });

    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hamburgerBtn.classList.remove('active');
            mobileMenu.classList.remove('open');
        });
    }

    // Close menu when a link/button is clicked
    const mobileLinks = document.querySelectorAll('.mobile-menu button, .mobile-menu a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Don't close if it's the close button
            if (this === closeMenuBtn) return;
            hamburgerBtn.classList.remove('active');
            mobileMenu.classList.remove('open');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.top-nav') && mobileMenu.classList.contains('open')) {
            hamburgerBtn.classList.remove('active');
            mobileMenu.classList.remove('open');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    updateNavButtons();
    // Add a small delay to ensure DOM is fully ready
    setTimeout(function() {
        initMobileMenu();
    }, 50);
});
