const API_BASE = 'http://localhost:5000/api';

async function testFullFlow() {
    console.log('\n=== TESTING COMPLETE FLOW ===\n');

    try {
        // 1. Register a test user
        console.log('1. Registering test user...');
        const registerRes = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: `testuser${Date.now()}@test.com`,
                password: 'password123'
            })
        });

        const registerData = await registerRes.json();
        if (!registerRes.ok) {
            console.error('❌ Registration failed:', registerData);
            return;
        }

        console.log('✅ User registered:', registerData.name);
        const token = registerData.token;

        // 2. Login with test user
        console.log('\n2. Logging in...');
        const loginRes = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: registerData.email,
                password: 'password123'
            })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) {
            console.error('❌ Login failed:', loginData);
            return;
        }

        console.log('✅ Login successful');
        console.log('   Token:', loginData.token.substring(0, 20) + '...');

        // 3. Add a resale item
        console.log('\n3. Adding resale item...');
        const resaleItemRes = await fetch(`${API_BASE}/clothing`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.token}`
            },
            body: JSON.stringify({
                title: 'Red Silk Saree',
                category: 'ethnic',
                type: 'resale',
                price: 5000,
                deposit: 0,
                size: 'Free Size',
                brand: 'Sabyasachi',
                condition: 'like_new',
                description: 'Beautiful red silkสaree, barely worn',
                images: []
            })
        });

        const resaleData = await resaleItemRes.json();
        if (!resaleItemRes.ok) {
            console.error('❌ Resale item failed:', resaleData);
            return;
        }

        console.log('✅ Resale item added:', resaleData.title);
        console.log('   ID:', resaleData._id);
        console.log('   Available:', resaleData.available);

        // 4. Add a rental item
        console.log('\n4. Adding rental item...');
        const rentalItemRes = await fetch(`${API_BASE}/clothing`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.token}`
            },
            body: JSON.stringify({
                title: 'Wedding Lehenga',
                category: 'wedding',
                type: 'rental',
                price: 500,
                deposit: 2000,
                size: '34',
                brand: 'Anita Dongre',
                condition: 'new',
                description: 'Elegant wedding lehenga with embroidery',
                images: []
            })
        });

        const rentalData = await rentalItemRes.json();
        if (!rentalItemRes.ok) {
            console.error('❌ Rental item failed:', rentalData);
            return;
        }

        console.log('✅ Rental item added:', rentalData.title);
        console.log('   ID:', rentalData._id);
        console.log('   Daily Rate: ₹' + rentalData.price);
        console.log('   Deposit: ₹' + rentalData.deposit);

        // 5. Get all items
        console.log('\n5. Fetching all items...');
        const allItemsRes = await fetch(`${API_BASE}/clothing`);
        const allItems = await allItemsRes.json();

        console.log('✅ Total items in database:', allItems.length);
        allItems.forEach((item, idx) => {
            console.log(`   ${idx + 1}. ${item.title} (${item.type}) - ₹${item.price}`);
        });

        // 6. Get resale items only
        console.log('\n6. Fetching resale items...');
        const resaleRes = await fetch(`${API_BASE}/clothing?type=resale`);
        const resaleItems = await resaleRes.json();

        console.log('✅ Resale items:', resaleItems.length);
        resaleItems.forEach((item, idx) => {
            console.log(`   ${idx + 1}. ${item.title} - ₹${item.price}`);
        });

        // 7. Get rental items only
        console.log('\n7. Fetching rental items...');
        const rentalRes = await fetch(`${API_BASE}/clothing?type=rental`);
        const rentalItems = await rentalRes.json();

        console.log('✅ Rental items:', rentalItems.length);
        rentalItems.forEach((item, idx) => {
            console.log(`   ${idx + 1}. ${item.title} - ₹${item.price}/day (Deposit: ₹${item.deposit})`);
        });

        console.log('\n=== ✅ ALL TESTS PASSED ===\n');
        console.log('🎉 Backend is working correctly!');
        console.log('💡 Items should now show on the frontend resale/rental pages.');

    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

testFullFlow();
