// Simple test script to verify API endpoints
const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
    console.log('Testing API endpoints...');

    try {
        // Test getting all clothing
        const response = await fetch(`${API_BASE}/clothing`);
        const data = await response.json();
        console.log('GET /api/clothing:', response.status, data);

        // Test auth endpoints (will fail without proper setup, but should not crash)
        const authResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@test.com', password: 'test' })
        });
        const authData = await authResponse.json();
        console.log('POST /api/auth/login:', authResponse.status, authData);

    } catch (error) {
        console.error('API test failed:', error.message);
    }
}

// Run test if this script is executed directly
if (require.main === module) {
    testAPI();
}

module.exports = { testAPI };