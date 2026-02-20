const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(express.static('client'));

const authRoutes = require('./routes/authRoutes');
const clothingRoutes = require('./routes/clothingRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/clothing', clothingRoutes);
app.use('/api/orders', orderRoutes);

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// After all routes
app.use(notFound);
app.use(errorHandler);

module.exports = app;