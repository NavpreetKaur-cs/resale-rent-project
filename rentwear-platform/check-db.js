require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const Clothing = require('./server/models/Clothing');

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check all items
        const allItems = await Clothing.find({});
        console.log('\n=== ALL ITEMS ===');
        console.log('Total items:', allItems.length);
        allItems.forEach(item => {
            console.log(`- ${item.title} | Type: ${item.type} | Available: ${item.available} | Seller: ${item.seller}`);
        });

        // Check available items
        const availableItems = await Clothing.find({ available: true });
        console.log('\n=== AVAILABLE ITEMS (available: true) ===');
        console.log('Total available:', availableItems.length);
        availableItems.forEach(item => {
            console.log(`- ${item.title} | Type: ${item.type} | Price: ₹${item.price}`);
        });

        // Check resale items
        const resaleItems = await Clothing.find({ type: 'resale', available: true });
        console.log('\n=== RESALE ITEMS ===');
        console.log('Total resale:', resaleItems.length);
        resaleItems.forEach(item => {
            console.log(`- ${item.title} | Price: ₹${item.price}`);
        });

        // Check rental items
        const rentalItems = await Clothing.find({ type: 'rental', available: true });
        console.log('\n=== RENTAL ITEMS ===');
        console.log('Total rental:', rentalItems.length);
        rentalItems.forEach(item => {
            console.log(`- ${item.title} | Daily Rate: ₹${item.price} | Deposit: ₹${item.deposit}`);
        });

        await mongoose.connection.close();
        console.log('\nDatabase check complete');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkDB();
