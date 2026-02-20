// Index page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('ReVogue index page loaded');

    // Update navigation based on login status
    updateNavigation();

    // Add any interactive functionality here
    // For example, smooth scrolling, animations, etc.
});

function updateNavigation() {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;

    if (isLoggedIn()) {
        authButtons.innerHTML = `
            <button onclick="window.location.href='profile.html'">Profile</button>
            <button onclick="logout()">Logout</button>
        `;
    } else {
        authButtons.innerHTML = `
            <button onclick="window.location.href='login.html'">Sign In</button>
            <button onclick="window.location.href='register.html'">Sign Up</button>
        `;
    }
}