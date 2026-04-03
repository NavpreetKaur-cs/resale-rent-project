const API_BASE = 'http://localhost:5000/api';

async function testEndpoints() {
    console.log('\n=== Testing API Endpoints ===\n');

    try {
        // Test 1: Get all items
        console.log('1. GET /api/clothing (all items)');
        const allRes = await fetch(`${API_BASE}/clothing`);
        const allData = await allRes.json();
        console.log('   Status:', allRes.status);
        console.log('   Items returned:', allData.length);
        allData.forEach(item => {
            console.log(`   - ${item.title} (${item.type}) - Available: ${item.available}`);
        });

        // Test 2: Get resale items
        console.log('\n2. GET /api/clothing?type=resale');
        const resaleRes = await fetch(`${API_BASE}/clothing?type=resale`);
        const resaleData = await resaleRes.json();
        console.log('   Status:', resaleRes.status);
        console.log('   Items returned:', resaleData.length);
        resaleData.forEach(item => {
            console.log(`   - ${item.title} - ₹${item.price}`);
        });

        // Test 3: Get rental items
        console.log('\n3. GET /api/clothing?type=rental');
        const rentalRes = await fetch(`${API_BASE}/clothing?type=rental`);
        const rentalData = await rentalRes.json();
        console.log('   Status:', rentalRes.status);
        console.log('   Items returned:', rentalData.length);
        rentalData.forEach(item => {
            console.log(`   - ${item.title} - ₹${item.price}/day`);
        });

        // Test 4: Check with seller info
        console.log('\n4. GET /api/clothing (checking seller info)');
        console.log('   First item seller:', allData[0]?.seller);
        console.log('   First item full data:', JSON.stringify(allData[0], null, 2).substring(0, 300) + '...');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testEndpoints();
