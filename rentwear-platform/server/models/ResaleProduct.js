const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: String,
    category: String,
    price: Number,
    image: String,
    description: String,
    available: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ResaleProduct', productSchema);