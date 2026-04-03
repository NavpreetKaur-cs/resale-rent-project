// Add Item Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Update nav buttons on page load
    updateNavButtons();
    
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    // Form submission
    const itemForm = document.getElementById('itemForm');
    if (itemForm) {
        itemForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await addItem();
        });
    }
});

async function addItem() {
    const itemData = {
        title: document.getElementById('title').value.trim(),
        category: document.getElementById('category').value,
        type: document.getElementById('type').value,
        price: parseFloat(document.getElementById('price').value),
        deposit: parseFloat(document.getElementById('deposit').value) || 0,
        size: document.getElementById('size').value.trim(),
        brand: document.getElementById('brand').value.trim(),
        condition: document.getElementById('condition').value,
        description: document.getElementById('description').value.trim(),
        images: []
    };

    // Validation
    if (!itemData.title) {
        showMessage('Please enter item title', 'error');
        return;
    }

    if (!itemData.category) {
        showMessage('Please select a category', 'error');
        return;
    }

    if (!itemData.type) {
        showMessage('Please select a type (Resale or Rental)', 'error');
        return;
    }

    if (!itemData.price || itemData.price <= 0) {
        showMessage('Please enter a valid price', 'error');
        return;
    }

    // Rental restrictions
    if (itemData.type === 'rental' && !(itemData.category === 'ethnic' || itemData.category === 'wedding')) {
        showMessage('Rental is only available for Ethnic and Wedding categories', 'error');
        return;
    }

    if (itemData.type === 'rental' && (!itemData.deposit || itemData.deposit <= 0)) {
        showMessage('Please enter a valid deposit for rental items', 'error');
        return;
    }

    try {
        console.log('Adding item:', itemData);
        
        const response = await fetch(`${API_BASE}/api/clothing`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(itemData)
        });

        const data = await response.json();

        console.log('Add item response:', response.status, data);

        if (response.ok) {
            showMessage('Item added successfully!', 'success');
            console.log('Item added. Redirecting to resale page...');
            setTimeout(() => {
                window.location.href = 'resale.html';
            }, 1500);
        } else {
            showMessage(data.message || 'Failed to add item', 'error');
        }
    } catch (error) {
        console.error('Error adding item:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

function showMessage(message, type = 'error') {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) return;
    
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}
