// Profile JavaScript
document.addEventListener('DOMContentLoaded', async function() {
    // Update nav buttons on page load
    updateNavButtons();
    initMobileMenu();
    updateCartCount();
    
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    // Load user profile
    await loadProfile();
    await loadUserOrders();
    await loadSellerOrders();
});

async function loadProfile() {
    try {
        const user = await getProfile();
        if (!user) {
            showMessage('Failed to load profile');
            return;
        }

        console.log('User data:', user); // Debug log
        
        const profileInfo = document.getElementById('profileInfo');
        const phoneValue = user.phone && user.phone.trim() ? user.phone : 'Not provided';
        const addressValue = user.location && user.location.trim() ? user.location : 'Not provided';
        
        profileInfo.innerHTML = `
            <div class="profile-details">
                <h3>${user.name}</h3>
                <p><strong>Email:</strong> ${user.email}</p>
                
                <div class="profile-field">
                    <strong>Phone Number:</strong> 
                    <span id="phoneDisplay">${phoneValue}</span>
                    <button onclick="editPhoneAddress('phone')" class="btn-edit">Edit</button>
                </div>
                <div id="phoneEdit" style="display: none;" class="profile-field-edit">
                    <input type="tel" id="phoneInput" placeholder="Enter phone number" value="${user.phone || ''}">
                    <button onclick="savePhoneAddress('phone')" class="btn-save">Save</button>
                    <button onclick="cancelEdit('phone')" class="btn-cancel">Cancel</button>
                </div>
                
                <div class="profile-field">
                    <strong>Address:</strong> 
                    <span id="addressDisplay">${addressValue}</span>
                    <button onclick="editPhoneAddress('address')" class="btn-edit">Edit</button>
                </div>
                <div id="addressEdit" style="display: none;" class="profile-field-edit">
                    <input type="text" id="addressInput" placeholder="Enter address" value="${user.location || ''}">
                    <button onclick="savePhoneAddress('address')" class="btn-save">Save</button>
                    <button onclick="cancelEdit('address')" class="btn-cancel">Cancel</button>
                </div>
                
                <p><strong>Reward Points:</strong> ${user.rewardPoints || 0}</p>
                <p><strong>Wallet Balance:</strong> ₹${user.walletBalance || 0}</p>
                <p><strong>Rating:</strong> ${user.rating || 0}/5</p>
                <p><strong>Member Since:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
        `;
    } catch (error) {
        console.error('Error loading profile:', error);
        document.getElementById('profileInfo').innerHTML = '<div class="error">Failed to load profile</div>';
    }
}

// Edit phone or address
function editPhoneAddress(field) {
    if (field === 'phone') {
        document.getElementById('phoneDisplay').style.display = 'none';
        document.getElementById('phoneEdit').style.display = 'block';
        document.getElementById('phoneInput').focus();
    } else if (field === 'address') {
        document.getElementById('addressDisplay').style.display = 'none';
        document.getElementById('addressEdit').style.display = 'block';
        document.getElementById('addressInput').focus();
    }
}

// Cancel edit
function cancelEdit(field) {
    if (field === 'phone') {
        document.getElementById('phoneDisplay').style.display = 'inline';
        document.getElementById('phoneEdit').style.display = 'none';
    } else if (field === 'address') {
        document.getElementById('addressDisplay').style.display = 'inline';
        document.getElementById('addressEdit').style.display = 'none';
    }
}

// Save phone or address
async function savePhoneAddress(field) {
    try {
        let updateData = {};
        let newValue = '';
        
        if (field === 'phone') {
            newValue = document.getElementById('phoneInput').value.trim();
            updateData = { phone: newValue };
        } else if (field === 'address') {
            newValue = document.getElementById('addressInput').value.trim();
            updateData = { location: newValue };
        }

        console.log('=== SAVE START ===');
        console.log('Field:', field);
        console.log('New Value:', newValue);
        console.log('Update Data:', updateData);
        console.log('Token:', getToken());
        console.log('API Base:', API_BASE);

        const response = await fetch(`${API_BASE}/api/auth/update-profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(updateData)
        });

        console.log('Response status:', response.status);
        console.log('Response statusText:', response.statusText);
        
        const data = await response.json();
        console.log('Response data:', data);

        if (response.ok) {
            console.log('Save successful, showing message and reloading profile');
            showMessage('Saved successfully!', 'success');
            setTimeout(async () => {
                console.log('Reloading profile...');
                await loadProfile();
            }, 500);
        } else {
            console.error('Server error response:', data);
            showMessage(data.message || 'Update failed');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        console.error('Error stack:', error.stack);
        showMessage('Network error. Please try again.');
    }
}

async function loadUserOrders() {
    try {
        const response = await fetch(`${API_BASE}/api/orders/my-orders`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        const orders = await response.json();

        const ordersSection = document.getElementById('ordersSection');
        const userOrdersDiv = document.getElementById('userOrders');

        if (orders.length === 0) {
            userOrdersDiv.innerHTML = '<p>You have no orders yet.</p>';
        } else {
            userOrdersDiv.innerHTML = orders.map(order => `
                <div class="order-card">
                    <div class="order-header">
                        <h4>${order.product.title}</h4>
                        <span class="order-status status-${order.status}">${order.status}</span>
                    </div>
                    <div class="order-details">
                        <p><strong>Type:</strong> ${order.orderType}</p>
                        <p><strong>Amount:</strong> ₹${order.amount}</p>
                        ${order.deposit ? `<p><strong>Deposit:</strong> ₹${order.deposit}</p>` : ''}
                        ${order.dueDate ? `<p><strong>Due Date:</strong> ${new Date(order.dueDate).toLocaleDateString()}</p>` : ''}
                        ${order.returnDate ? `<p><strong>Return Date:</strong> ${new Date(order.returnDate).toLocaleDateString()}</p>` : ''}
                        ${order.lateFee ? `<p><strong>Late Fee:</strong> ₹${order.lateFee}</p>` : ''}
                        ${order.ratingPoints ? `<p><strong>Rating Points Earned:</strong> ${order.ratingPoints} ⭐</p>` : ''}
                        <p><strong>Ordered:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    ${order.orderType === 'rental' && order.status === 'confirmed' ? 
                        `<button onclick="returnOrder('${order._id}')" class="btn-return">Return Item</button>` : ''}
                </div>
            `).join('');
        }
        ordersSection.style.display = 'block';
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('userOrders').innerHTML = '<div class="error">Failed to load orders</div>';
    }
}

async function loadSellerOrders() {
    try {
        const response = await fetch(`${API_BASE}/api/orders/seller-orders`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        const orders = await response.json();

        const sellerOrdersSection = document.getElementById('sellerOrdersSection');
        const sellerOrdersDiv = document.getElementById('sellerOrders');

        if (orders.length === 0) {
            sellerOrdersDiv.innerHTML = '<p>No customer orders yet.</p>';
        } else {
            sellerOrdersDiv.innerHTML = orders.map(order => `
                <div class="order-card">
                    <div class="order-header">
                        <h4>${order.product.title}</h4>
                        <span class="order-status status-${order.status}">${order.status}</span>
                    </div>
                    <div class="order-details">
                        <p><strong>Buyer:</strong> ${order.buyer.name} (${order.buyer.email})</p>
                        <p><strong>Phone:</strong> ${order.buyer.phone || 'Not provided'}</p>
                        <p><strong>Type:</strong> ${order.orderType}</p>
                        <p><strong>Amount:</strong> ₹${order.amount}</p>
                        ${order.deposit ? `<p><strong>Deposit:</strong> ₹${order.deposit}</p>` : ''}
                        ${order.dueDate ? `<p><strong>Due Date:</strong> ${new Date(order.dueDate).toLocaleDateString()}</p>` : ''}
                        ${order.returnDate ? `<p><strong>Return Date:</strong> ${new Date(order.returnDate).toLocaleDateString()}</p>` : ''}
                        ${order.lateFee ? `<p><strong>Late Fee:</strong> ₹${order.lateFee}</p>` : ''}
                        ${order.buyerRating ? `<p><strong>Buyer Rating:</strong> ${order.buyerRating}/5 ⭐</p>` : ''}
                        ${order.ratingPoints ? `<p><strong>Rating Points Earned:</strong> ${order.ratingPoints} ⭐</p>` : ''}
                        <p><strong>Ordered:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div class="order-actions">
                        ${order.status === 'pending' ? 
                            `<button onclick="updateOrderStatus('${order._id}', 'confirmed')" class="btn-confirm">Confirm Order</button>` : ''}
                        ${order.orderType === 'rental' && order.status === 'confirmed' ? 
                            `<button onclick="updateOrderStatus('${order._id}', 'completed')" class="btn-complete">Mark Completed</button>` : ''}
                        ${order.orderType === 'resale' && order.status === 'confirmed' ? 
                            `<button onclick="updateOrderStatus('${order._id}', 'completed')" class="btn-complete">Mark Completed</button>` : ''}
                    </div>
                </div>
            `).join('');
        }
        sellerOrdersSection.style.display = 'block';
    } catch (error) {
        console.error('Error loading seller orders:', error);
        document.getElementById('sellerOrders').innerHTML = '<div class="error">Failed to load customer orders</div>';
    }
}

async function returnOrder(orderId) {
    try {
        const response = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ status: 'returned' })
        });
        const result = await response.json();
        if (response.ok) {
            alert('Item returned successfully!');
            loadUserOrders();
        } else {
            alert('Failed to return item: ' + result.message);
        }
    } catch (error) {
        console.error('Error returning order:', error);
        alert('Network error. Please try again.');
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ status })
        });
        const result = await response.json();
        if (response.ok) {
            alert(`Order ${status} successfully!`);
            loadSellerOrders();
        } else {
            alert('Failed to update order: ' + result.message);
        }
    } catch (error) {
        console.error('Error updating order:', error);
        alert('Network error. Please try again.');
    }
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