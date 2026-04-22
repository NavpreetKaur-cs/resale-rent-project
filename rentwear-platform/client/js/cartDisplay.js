// Cart Display Functions
const API_BASE = 'http://localhost:5000';

function displayCartItems() {
    console.log('Displaying cart items');
    const cart = getCart();
    const cartList = document.getElementById('cartItemsList');

    if (!cart || cart.length === 0) {
        cartList.innerHTML = '<div class="empty-cart"><p>Your cart is empty</p><button onclick="window.location.href=\'resale.html\'" class="btn-shop">Continue Shopping</button></div>';
        document.getElementById('checkoutBtn').disabled = true;
        return;
    }

    cartList.innerHTML = cart.map((item) => {
        return `
            <div class="cart-item">
                <div class="item-image">
                    ${item.images && item.images.length > 0 
                        ? `<img src="${item.images[0]}" alt="${item.title}">`
                        : '<div class="no-image">No Image</div>'}
                </div>
                <div class="item-info">
                    <h4>${item.title || 'Item'}</h4>
                    <p><strong>Type:</strong> ${item.type || 'N/A'}</p>
                    <p><strong>Category:</strong> ${item.category || 'N/A'}</p>
                    <p><strong>Seller:</strong> ${item.seller?.name || 'Unknown'}</p>
                    <p><strong>Price:</strong> ₹${item.price || 0}</p>
                </div>
                <div class="item-quantity">
                    <label>Quantity:</label>
                    <div class="quantity-control">
                        <button onclick="decreaseQuantity('${item._id}')">−</button>
                        <input type="number" value="${item.quantity || 1}" min="1" onchange="updateQuantity('${item._id}', this.value)">
                        <button onclick="increaseQuantity('${item._id}')">+</button>
                    </div>
                </div>
                <div class="item-total">
                    <p>₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                </div>
                <div class="item-actions">
                    <button onclick="removeItemFromCart('${item._id}')" class="btn-remove">Remove</button>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('checkoutBtn').disabled = false;
}

function increaseQuantity(itemId) {
    const cart = getCart();
    const item = cart.find(i => i._id === itemId);
    if (item) {
        item.quantity = (item.quantity || 1) + 1;
        saveCart(cart);
        displayCartItems();
        updateSummary();
    }
}

function decreaseQuantity(itemId) {
    const cart = getCart();
    const item = cart.find(i => i._id === itemId);
    if (item && (item.quantity || 1) > 1) {
        item.quantity = (item.quantity || 1) - 1;
        saveCart(cart);
        displayCartItems();
        updateSummary();
    }
}

function updateQuantity(itemId, value) {
    const qty = parseInt(value);
    if (qty > 0) {
        updateCartItemQuantity(itemId, qty);
        displayCartItems();
        updateSummary();
    }
}

function removeItemFromCart(itemId) {
    if (confirm('Remove this item from cart?')) {
        removeFromCart(itemId);
        displayCartItems();
        updateSummary();
    }
}

function updateSummary() {
    const subtotal = getCartTotal();
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = '₹' + subtotal.toFixed(2);
    document.getElementById('tax').textContent = '₹' + tax.toFixed(2);
    document.getElementById('total').textContent = '₹' + total.toFixed(2);
}

async function proceedToCheckout() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }

    try {
        const orders = [];
        for (const item of cart) {
            const response = await fetch(`${API_BASE}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    productId: item._id,
                    orderType: item.type,
                    rentalDays: item.type === 'rental' ? 7 : undefined
                })
            });

            const data = await response.json();
            if (response.ok) {
                orders.push(data);
            } else {
                alert(`Failed to place order for ${item.title}: ${data.message}`);
                return;
            }
        }

        alert('All orders placed successfully!');
        clearCart();
        window.location.href = 'profile.html';
    } catch (error) {
        console.error('Error during checkout:', error);
        alert('Network error. Please try again.');
    }
}

// Initialize cart on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cart display page loaded');
    updateNavButtons();
    updateCartCount();
    displayCartItems();
    updateSummary();

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
});
