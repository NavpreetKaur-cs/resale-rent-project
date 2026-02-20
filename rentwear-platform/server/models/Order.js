const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clothing",
        required: true
    },

    orderType: {
        type: String,
        enum: ["resale", "rental"],
        required: true
    },

    amount: { type: Number, required: true },

    deposit: { type: Number, default: 0 },

    dueDate: Date,
    returnDate: Date,
    lateFee: { type: Number, default: 0 },

    status: {
        type: String,
        enum: ["pending", "confirmed", "completed", "returned", "cancelled"],
        default: "pending"
    }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);