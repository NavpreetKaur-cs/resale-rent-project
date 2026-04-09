const API_BASE = 'http://localhost:5000/api';

async function testLoginFlow() {
    console.log('\n=== Testing Authentication Flow ===\n');

    try {
        // Test 1: Register a new user
        console.log('1. Testing User Registration');
        const registerRes = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User Contest',
                email: `testcontest${Date.now()}@test.com`,
                password: 'password123'
            })
        });

        const registerData = await registerRes.json();
        if (registerRes.ok) {
            console.log('   ✓ Registration successful');
            console.log('   Token received:', !!registerData.token);

            const token = registerData.token;

            // Test 2: Get profile
            console.log('\n2. Testing Get Profile (with token)');
            const profileRes = await fetch(`${API_BASE}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const profileData = await profileRes.json();
            if (profileRes.ok) {
                console.log('   ✓ Profile retrieved successfully');
                console.log('   User ID:', profileData._id);
                console.log('   User Name:', profileData.name);
                console.log('   User Email:', profileData.email);

                // Test 3: Create contest with token
                console.log('\n3. Testing Create Contest (with token)');
                const contestRes = await fetch(`${API_BASE}/contests`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title: 'Test Contest',
                        theme: 'Summer Fashion',
                        category: 'Casual',
                        gender: 'Women',
                        budget: 5000
                    })
                });

                const contestData = await contestRes.json();
                if (contestRes.ok) {
                    console.log('   ✓ Contest created successfully');
                    console.log('   Contest ID:', contestData._id);
                    console.log('   Contest Title:', contestData.title);
                } else {
                    console.log('   ✗ Contest creation failed');
                    console.log('   Error:', contestData.message);
                }
            } else {
                console.log('   ✗ Profile retrieval failed');
            }
        } else {
            console.log('   ✗ Registration failed');
            console.log('   Error:', registerData.message);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    console.log('\n✓ Authentication flow test complete\n');
}

testLoginFlow();
