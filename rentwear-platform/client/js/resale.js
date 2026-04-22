// Resale page JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Update nav buttons on page load
  updateNavButtons();
  initMobileMenu();
  updateCartCount();
  
  loadResaleItems();

  // Apply filters
  const applyFiltersBtn = document.getElementById('applyFilters');
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', function() {
      loadResaleItems();
    });
  }

  // Add item button - navigate to add-item page
  const addItemBtn = document.getElementById('addItemBtn');
  if (addItemBtn) {
    if (isLoggedIn()) {
      addItemBtn.style.display = 'inline-block';
    } else {
      addItemBtn.style.display = 'none';
    }
  }
});

async function loadResaleItems() {
  try {
    const category = document.getElementById('categoryFilter').value;
    const type = document.getElementById('typeFilter') ? document.getElementById('typeFilter').value : 'resale';
    const maxPrice = document.getElementById('maxPrice').value;

    let url = `${API_BASE}/api/clothing`;

    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (category) params.append('category', category);
    if (maxPrice) params.append('maxPrice', maxPrice);

    if ([...params].length) {
      url += `?${params.toString()}`;
    }

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
    console.error('Error loading resale items:', error);
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
    container.innerHTML = '<div class="no-items">No resale items available</div>';
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
          <p><strong>Condition:</strong> ${item.condition}</p>
          <p><strong>Price:</strong> <span class="price">₹${item.price}</span></p>
        </div>
        ${item.description ? `<div class="item-description"><p><strong>Description:</strong> ${item.description}</p></div>` : ''}
        <div class="item-buttons">
          <button onclick="buyItem('${item._id}')" class="btn-buy">Buy Now</button>
          <button onclick="addItemToCart('${item._id}', '${item.title}', ${item.price}, '${item.type}', '${item.category}')" class="btn-cart">Add to Cart</button>
        </div>
      </div>
    </div>
  `;
  }).join('');

  container.innerHTML = itemsHTML;
}

async function buyItem(itemId) {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  if (!confirm('Are you sure you want to purchase this item?')) return;

  try {
    const response = await fetch(`${API_BASE}/api/orders`, {
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