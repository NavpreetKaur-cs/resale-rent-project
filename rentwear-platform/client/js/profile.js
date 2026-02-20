// Profile JavaScript
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    // Load user profile
    await loadProfile();

    // Add item button
    const addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', () => {
            window.location.href = 'resale.html'; // Or create a separate add item page
        });
    }
});

async function loadProfile() {
    try {
        const user = await getProfile();
        if (!user) {
            showMessage('Failed to load profile');
            return;
        }

        const profileInfo = document.getElementById('profileInfo');
        profileInfo.innerHTML = `
            <div class="profile-details">
                <h3>${user.name}</h3>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Reward Points:</strong> ${user.rewardPoints || 0}</p>
                <p><strong>Wallet Balance:</strong> ₹${user.walletBalance || 0}</p>
                <p><strong>Rating:</strong> ${user.rating || 0}/5</p>
            </div>
        `;
    } catch (error) {
        console.error('Error loading profile:', error);
        document.getElementById('profileInfo').innerHTML = '<div class="error">Failed to load profile</div>';
    }
}