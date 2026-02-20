// Cart functionality (for future enhancement)
// Currently using direct purchase/rental, but cart can be added later

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(item) {
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item._id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

function getCartItems() {
    return cart;
}

function clearCart() {
    cart = [];
    localStorage.removeItem('cart');
    updateCartDisplay();
}

function updateCartDisplay() {
    // Update cart UI if it exists
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

// Initialize cart display on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartDisplay();
});