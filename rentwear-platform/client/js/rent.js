// Rent page JavaScript
const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', function() {
    loadRentalItems();

    // Apply filters
    document.getElementById('applyFilters').addEventListener('click', function() {
        loadRentalItems();
    });
});

async function loadRentalItems() {
    try {
        const category = document.getElementById('categoryFilter').value;
        const maxPrice = document.getElementById('maxPrice').value;

        let url = `${API_BASE}/clothing?type=rental`;
        if (category) url += `&category=${category}`;
        if (maxPrice) url += `&maxPrice=${maxPrice}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to load items');
        }

        displayItems(data);
    } catch (error) {
        console.error('Error loading rental items:', error);
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
        container.innerHTML = '<div class="no-items">No rental items available</div>';
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
                <p><strong>Deposit:</strong> ₹${item.deposit}</p>
                <p><strong>Daily Rate:</strong> ₹${item.price}</p>
                <p><strong>Condition:</strong> ${item.condition}</p>
                <button onclick="rentItem('${item._id}')">Rent Now</button>
            </div>
        </div>
    `).join('');
}

async function rentItem(itemId) {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const rentalDays = prompt('Enter number of rental days:');
    if (!rentalDays || rentalDays <= 0) return;

    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                productId: itemId,
                orderType: 'rental',
                rentalDays: parseInt(rentalDays)
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Rental order placed successfully!');
            window.location.href = 'profile.html';
        } else {
            alert(data.message || 'Failed to place order');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Network error. Please try again.');
    }
}