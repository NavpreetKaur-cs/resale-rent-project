// Rent page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Update nav buttons on page load
    updateNavButtons();
    initMobileMenu();
    updateCartCount();
    
    loadRentalItems();

    // Apply filters
    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            loadRentalItems();
        });
    }

    // Add item button
    const addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
        if (isLoggedIn()) {
            addItemBtn.style.display = 'inline-block';
        } else {
            addItemBtn.style.display = 'none';
        }
    }
});

async function loadRentalItems() {
    try {
        const category = document.getElementById('categoryFilter').value;
        const maxPrice = document.getElementById('maxPrice').value;

        let url = `${API_BASE}/api/clothing?type=rental`;
        if (category) url += `&category=${category}`;
        if (maxPrice) url += `&maxPrice=${maxPrice}`;

        console.log('Fetching from:', url);
        const response = await fetch(url);
        const data = await response.json();

        console.log('Response status:', response.status);
        console.log('Items received:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to load items');
        }

        displayItems(data);
    } catch (error) {
        console.error('Error loading rental items:', error);
        document.getElementById('clothingList').innerHTML =
          `<div class="error">${error.message}</div>`;
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

    const itemsHTML = items.map(item => {
        const stars = '⭐'.repeat(Math.round(item.seller?.rating || 0));
        const rating = (item.seller?.rating || 0).toFixed(1);
        const image = item.images && item.images.length > 0
            ? `<img src="${item.images[0]}" alt="${item.title}">`
            : '<div class="no-image">No Image</div>';

        return `
        <div class="clothing-item">
            <div class="item-image">
                ${image}
            </div>
            <div class="seller-header">
                <h4>${item.seller?.name || 'Unknown Seller'}</h4>
                <div class="seller-rating">
                    ${stars}
                    <span class="rating-text">${rating}</span>
                </div>
            </div>
            <div class="item-details">
                <h3>${item.title}</h3>
                <div class="item-info-grid">
                    <p><strong>Category:</strong> ${item.category}</p>
                    <p><strong>Size:</strong> ${item.size || 'N/A'}</p>
                    <p><strong>Deposit:</strong> ₹${item.deposit}</p>
                    <p><strong>Daily Rate:</strong> <span class="price">₹${item.price}</span></p>
                </div>
                <div class="item-buttons">
                    <button onclick="rentItem('${item._id}')" class="btn-buy">Rent Now</button>
                    <button onclick="addItemToCart('${item._id}', '${item.title}', ${item.price}, '${item.type}', '${item.category}')" class="btn-cart">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
    }).join('');

    container.innerHTML = itemsHTML;
}

async function rentItem(itemId) {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const rentalDays = prompt('Enter number of rental days:');
    if (!rentalDays || rentalDays <= 0) return;

    try {
        const response = await fetch(`${API_BASE}/api/orders`, {
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

function addItemToCart(itemId, title, price, type, category) {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const item = {
        _id: itemId,
        title: title,
        price: parseFloat(price),
        type: type,
        category: category
    };

    addToCart(itemId, item);
}
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