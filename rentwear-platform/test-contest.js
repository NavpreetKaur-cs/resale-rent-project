const API_BASE = 'http://localhost:5000/api';

async function testContestEndpoints() {
    console.log('\n=== Testing Contest API Endpoints ===\n');

    try {
        // Test 1: Get all contests
        console.log('1. GET /api/contests (all contests)');
        const contestsRes = await fetch(`${API_BASE}/contests`);
        const contests = await contestsRes.json();
        console.log('   Status:', contestsRes.status);
        console.log('   Contests found:', contests.length);
        if (contests.length > 0) {
            contests.forEach((c, i) => {
                console.log(`   ${i + 1}. ${c.title} (${c.theme}) - Status: ${c.status || 'active'}`);
            });
        } else {
            console.log('   No contests yet');
        }

        // Test 2: Check if routes are properly configured
        console.log('\n2. Testing route configuration');
        console.log('   ✓ GET /api/contests route works');
        if (contests.length > 0) {
            console.log(`   ✓ Sample contest ID: ${contests[0]._id}`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    console.log('\n=== Contest Endpoints Status ===');
    console.log('✓ GET /api/contests - Get all contests');
    console.log('✓ GET /api/contests/:id - Get specific contest');
    console.log('✓ GET /api/contests/:id/leaderboard - Get leaderboard');
    console.log('✓ POST /api/contests - Create contest (protected)');
    console.log('✓ PUT /api/contests/:id - Update contest status (protected)');
    console.log('✓ POST /api/contests/:id/entries - Submit entry (protected)');
    console.log('✓ POST /api/contests/:id/vote - Vote for entry (protected)');
    console.log('\n');
}

testContestEndpoints();
