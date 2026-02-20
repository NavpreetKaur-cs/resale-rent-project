const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.log('Server will continue without database connection. Some features may not work.');
    // Don't exit - let the server run without DB
  }
};

module.exports = connectDB;