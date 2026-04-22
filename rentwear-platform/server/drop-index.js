const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const dropIndex = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get the users collection
    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Drop the location_2dsphere index
    try {
      const result = await collection.dropIndex('location_2dsphere');
      console.log('? Successfully dropped location_2dsphere index');
      console.log('Result:', result);
    } catch (indexError) {
      console.log('Index status: ' + indexError.message);
    }

    // List remaining indexes
    const indexes = await collection.getIndexes();
    console.log('\nRemaining indexes on users collection:');
    console.log(JSON.stringify(indexes, null, 2));

    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

dropIndex();
