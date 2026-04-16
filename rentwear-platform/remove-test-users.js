require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const User = require('./server/models/User');
const Clothing = require('./server/models/Clothing');
const Order = require('./server/models/Order');

async function removeTestUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        // Find all test users (emails containing @test.com)
        const testUsers = await User.find({ email: { $regex: '@test.com' } });
        console.log(`Found ${testUsers.length} test users:\n`);
        
        if (testUsers.length === 0) {
            console.log('No test users found!');
            await mongoose.connection.close();
            return;
        }

        testUsers.forEach(user => {
            console.log(`- ${user.name} (${user.email})`);
        });

        const testUserIds = testUsers.map(u => u._id);

        // Remove test users' items
        const deletedClothing = await Clothing.deleteMany({ seller: { $in: testUserIds } });
        console.log(`\n✓ Deleted ${deletedClothing.deletedCount} clothing items from test users`);

        // Remove test users' orders (both as buyer and seller)
        const deletedOrders = await Order.deleteMany({ 
            $or: [
                { buyer: { $in: testUserIds } },
                { product: { $in: await Clothing.find({ seller: { $in: testUserIds } }, '_id') } }
            ]
        });
        console.log(`✓ Deleted ${deletedOrders.deletedCount} orders related to test users`);

        // Remove test users
        const deletedUsers = await User.deleteMany({ _id: { $in: testUserIds } });
        console.log(`✓ Deleted ${deletedUsers.deletedCount} test users\n`);

        // Show remaining users
        const remainingUsers = await User.find({}, 'name email role');
        console.log(`Remaining users (${remainingUsers.length}):`);
        remainingUsers.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
        });

        await mongoose.connection.close();
        console.log('\n✓ Done! All test users removed.');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

removeTestUsers();
