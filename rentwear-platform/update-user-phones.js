require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const User = require('./server/models/User');

async function updatePhones() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Update users without phone to have a placeholder
        const result = await User.updateMany(
            { phone: { $in: [null, '', undefined] } },
            { phone: '0000000000' } // Placeholder phone
        );

        console.log(`Updated ${result.modifiedCount} users with placeholder phone number`);

        // Verify update
        const usersWithoutPhone = await User.find({ phone: { $in: [null, '', undefined] } });
        console.log(`Users still without phone: ${usersWithoutPhone.length}`);

        const usersWithPhone = await User.find({ phone: { $ne: null, $ne: '' } });
        console.log(`Total users with phone: ${usersWithPhone.length}`);

        await mongoose.connection.close();
        console.log('Migration complete');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

updatePhones();
