const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    rewardPoints: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    // Simplified location: no GeoJSON, no 2dsphere
    location: {
      type: String, // e.g. "Ludhiana, Punjab"
    },
  },
  { timestamps: true }
);

// REMOVE geospatial index line
// userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
