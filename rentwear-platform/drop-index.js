const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/.env' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const db = mongoose.connection.db;
    
    // Drop the location 2dsphere index
    await db.collection('users').dropIndex('location_2dsphere');
    console.log('Successfully dropped location_2dsphere index');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.message.includes('index not found')) {
      console.log('Index does not exist (already dropped or never existed)');
      process.exit(0);
    }
    process.exit(1);
  }
};

connectDB();
