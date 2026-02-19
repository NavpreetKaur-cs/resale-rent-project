const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products : [{productId: String, quantity: Number}],
    totalAmount : Number,
    status : { type: String, default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);