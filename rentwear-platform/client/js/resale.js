// Resale page JavaScript
const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', function() {
    loadResaleItems();

    // Apply filters
    document.getElementById('applyFilters').addEventListener('click', function() {
        loadResaleItems();
    });

    // Add item button
    document.getElementById('addItemBtn').addEventListener('click', function() {
        showAddItemForm();
    });
});

async function loadResaleItems() {
    try {
        const category = document.getElementById('categoryFilter').value;
        const maxPrice = document.getElementById('maxPrice').value;

        let url = `${API_BASE}/clothing?type=resale`;
        if (category) url += `&category=${category}`;
        if (maxPrice) url += `&maxPrice=${maxPrice}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to load items');
        }

        displayItems(data);
    } catch (error) {
        console.error('Error loading resale items:', error);
        document.getElementById('clothingList').innerHTML = `<div class="error">${error.message}</div>`;
    }
}

function displayItems(items) {
    const container = document.getElementById('clothingList');

    if (!Array.isArray(items)) {
        container.innerHTML = '<div class="error">Invalid data received from server</div>';
        return;
    }

    if (items.length === 0) {
        container.innerHTML = '<div class="no-items">No resale items available</div>';
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="clothing-item">
            <div class="item-image">
                ${item.images && item.images.length > 0 ?
                    `<img src="${item.images[0]}" alt="${item.title}">` :
                    '<div class="no-image">No Image</div>'}
            </div>
            <div class="item-details">
                <h3>${item.title}</h3>
                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Size:</strong> ${item.size || 'N/A'}</p>
                <p><strong>Price:</strong> ₹${item.price}</p>
                <p><strong>Condition:</strong> ${item.condition}</p>
                <p><strong>Seller:</strong> ${item.seller?.name || 'Unknown'}</p>
                <button onclick="buyItem('${item._id}')">Buy Now</button>
            </div>
        </div>
    `).join('');
}

async function buyItem(itemId) {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    if (!confirm('Are you sure you want to purchase this item?')) return;

    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                productId: itemId,
                orderType: 'resale'
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Purchase order placed successfully!');
            window.location.href = 'profile.html';
        } else {
            alert(data.message || 'Failed to place order');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Network error. Please try again.');
    }
}

function showAddItemForm() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    // Simple form for adding items (in a real app, this would be a modal or separate page)
    const formHtml = `
        <div class="add-item-form">
            <h3>Add Item for Sale</h3>
            <form id="itemForm">
                <div class="form-group">
                    <label for="title">Item Title</label>
                    <input type="text" id="title" placeholder="Item Title" required>
                </div>
                <div class="form-group">
                    <label for="category">Category</label>
                    <select id="category" required>
                        <option value="">Select Category</option>
                        <option value="casual">Casual</option>
                        <option value="ethnic">Ethnic</option>
                        <option value="wedding">Wedding</option>
                        <option value="party">Party</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="type">Type</label>
                    <select id="type" required>
                        <option value="resale">Resale</option>
                        <option value="rental">Rental</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="price">Price (₹)</label>
                    <input type="number" id="price" placeholder="Price" required>
                </div>
                <div class="form-group">
                    <label for="deposit">Deposit (for rental)</label>
                    <input type="number" id="deposit" placeholder="Deposit (for rental)">
                </div>
                <div class="form-group">
                    <label for="size">Size</label>
                    <input type="text" id="size" placeholder="Size">
                </div>
                <div class="form-group">
                    <label for="brand">Brand</label>
                    <input type="text" id="brand" placeholder="Brand">
                </div>
                <div class="form-group">
                    <label for="condition">Condition</label>
                    <select id="condition">
                        <option value="new">New</option>
                        <option value="like_new">Like New</option>
                        <option value="gently_used">Gently Used</option>
                        <option value="heavily_used">Heavily Used</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" placeholder="Description"></textarea>
                </div>
                <div class="form-buttons">
                    <button type="submit">Add Item</button>
                    <button type="button" onclick="hideAddItemForm()">Cancel</button>
                </div>
            </form>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', formHtml);

    document.getElementById('itemForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await addItem();
    });
}

function hideAddItemForm() {
    const form = document.querySelector('.add-item-form');
    if (form) form.remove();
}

async function addItem() {
    const itemData = {
        title: document.getElementById('title').value,
        category: document.getElementById('category').value,
        type: document.getElementById('type').value,
        price: parseFloat(document.getElementById('price').value),
        deposit: parseFloat(document.getElementById('deposit').value) || 0,
        size: document.getElementById('size').value,
        brand: document.getElementById('brand').value,
        condition: document.getElementById('condition').value,
        description: document.getElementById('description').value,
        images: [] // In a real app, handle file uploads
    };

    try {
        const response = await fetch(`${API_BASE}/clothing`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(itemData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Item added successfully!');
            hideAddItemForm();
            loadResaleItems(); // Refresh the list
        } else {
            alert(data.message || 'Failed to add item');
        }
    } catch (error) {
        console.error('Error adding item:', error);
        alert('Network error. Please try again.');
    }
}