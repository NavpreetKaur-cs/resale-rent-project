const mongoose = require('mongoose');
const rewardSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    points: { type: Number, required: true , default: 0},
    description: String
}, { timestamps: true });