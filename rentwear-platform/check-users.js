require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const User = require('./server/models/User');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check all users
        const allUsers = await User.find({});
        console.log('\n=== ALL USERS ===');
        console.log('Total users:', allUsers.length);
        allUsers.forEach(user => {
            console.log(`- Name: ${user.name} | Email: ${user.email} | Phone: ${user.phone || 'NOT SET'}`);
        });

        // Check users without phone
        const usersWithoutPhone = await User.find({ phone: { $in: [null, '', undefined] } });
        console.log('\n=== USERS WITHOUT PHONE ===');
        console.log('Total:', usersWithoutPhone.length);
        usersWithoutPhone.forEach(user => {
            console.log(`- ${user.name} (${user.email})`);
        });

        // Check orders and buyer details
        const Order = require('./server/models/Order');
        const orders = await Order.find().populate('buyer', 'name email phone').limit(10);
        console.log('\n=== SAMPLE ORDERS WITH BUYER DETAILS ===');
        orders.forEach(order => {
            console.log(`- Buyer: ${order.buyer.name} | Email: ${order.buyer.email} | Phone: ${order.buyer.phone || 'NOT SET'}`);
        });

        await mongoose.connection.close();
        console.log('\nUser check complete');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkUsers();
