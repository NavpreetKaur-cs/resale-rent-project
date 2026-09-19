// Cart Management JavaScript
const CART_STORAGE_KEY = 'revesto_cart';

function getCart() {
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    if (!cart) return [];
    try {
        const parsed = JSON.parse(cart);
        return Array.isArray(parsed) ? parsed.filter(item => item && item._id) : [];
    } catch (error) {
        console.warn('Invalid cart data was cleared.');
        localStorage.removeItem(CART_STORAGE_KEY);
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
}

function addToCart(itemId, item) {
    const cart = getCart();
    const existingItem = cart.find(i => i._id === itemId);
    
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        item.quantity = 1;
        cart.push(item);
    }
    
    saveCart(cart);
    showCartMessage('Item added to cart!');
}

function removeFromCart(itemId) {
    let cart = getCart();
    cart = cart.filter(i => i._id !== itemId);
    saveCart(cart);
}

function updateCartItemQuantity(itemId, quantity) {
    const cart = getCart();
    const item = cart.find(i => i._id === itemId);
    if (item) {
        quantity = Number.parseInt(quantity, 10);
        if (!Number.isFinite(quantity) || quantity <= 0) {
            removeFromCart(itemId);
        } else {
            item.quantity = Math.min(quantity, 99);
            saveCart(cart);
        }
    }
}

function clearCart() {
    localStorage.removeItem(CART_STORAGE_KEY);
    updateCartCount();
}

function getCartTotal() {
    return getCart().reduce((total, item) => {
        return total + (item.price * (item.quantity || 1));
    }, 0);
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
        cartCountElement.style.display = count > 0 ? 'inline' : 'none';
    }
}

function showCartMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 2001;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 2000);
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});
