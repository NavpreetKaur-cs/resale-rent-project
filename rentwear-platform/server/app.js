const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Serve static files from client directory
app.use('/client', express.static(path.join(__dirname, '../client')));
app.use('/', express.static(path.join(__dirname, '../client')));

// Routes
const authRoutes = require('./routes/authRoutes');
const clothingRoutes = require('./routes/clothingRoutes');
const orderRoutes = require('./routes/orderRoutes');
const contestRoutes = require('./routes/contestRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/clothing', clothingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contests', contestRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('API Running...');
});

// Error Handling Middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

module.exports = app;
