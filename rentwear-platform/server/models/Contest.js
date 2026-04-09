const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    theme: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        required: true 
    },
    gender: { 
        type: String, 
        enum: ["Men", "Women", "Unisex"],
        required: true 
    },
    budget: { 
        type: Number, 
        required: true 
    },
    maxParticipants: {
        type: Number,
        default: 999
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    entries: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        username: String,
        image: String,
        productLinks: [String],
        votes: { type: Number, default: 0 },
        ratingPoints: { type: Number, default: 0 },
        position: { type: Number, default: null }, // 1, 2, or 3
        createdAt: { type: Date, default: Date.now }
    }],
    votes: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        entryId: mongoose.Schema.Types.ObjectId,
        createdAt: { type: Date, default: Date.now }
    }],
    winners: [{
        position: { type: Number }, // 1, 2, 3
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        ratingPoints: { type: Number, default: 0 },
        selectedAt: { type: Date, default: Date.now }
    }],
    status: {
        type: String,
        enum: ["active", "closed"],
        default: "active"
    }
}, { timestamps: true });

module.exports = mongoose.model('Contest', contestSchema);
