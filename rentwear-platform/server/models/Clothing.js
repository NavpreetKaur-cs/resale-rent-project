const mongoose = require("mongoose");

const clothingSchema = new mongoose.Schema({
    title: { type: String, required: true },

    category: {
        type: String,
        enum: ["casual", "ethnic", "wedding", "party"],
        required: true
    },

    type: {
        type: String,
        enum: ["resale", "rental"],
        required: true
    },

    price: { type: Number, required: true }, 
    deposit: { type: Number, default: 0 },  

    description: String,

    size: String,
    brand: String,
    condition: {
        type: String,
        enum: ["new", "like_new", "gently_used", "heavily_used"]
    },

    images: [String],

    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    available: { type: Boolean, default: true }

}, { timestamps: true });

module.exports = mongoose.model("Clothing", clothingSchema);