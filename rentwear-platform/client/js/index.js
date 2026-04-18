// Index page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('ReVesto index page loaded');

    // Update navigation based on login status
    updateNavButtons();
    updateCartCount();

    // Mobile Menu Toggle
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenuBtn = document.getElementById('closeMenuBtn');

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', function() {
            hamburgerBtn.classList.toggle('active');
            mobileMenu.classList.toggle('open');
        });
    }

    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', function() {
            hamburgerBtn.classList.remove('active');
            mobileMenu.classList.remove('open');
        });
    }

    // Close menu when a link is clicked
    const mobileLinks = document.querySelectorAll('.mobile-menu button');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
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
});
