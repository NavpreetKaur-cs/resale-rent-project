const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client();

// Check database connection
const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '12h', // token valid for 12 hours
  });
};

const getAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  location: user.location,
  rewardPoints: user.rewardPoints,
  token: generateToken(user._id),
});

const getGoogleClientId = (req, res) => {
  res.json({ clientId: process.env.GOOGLE_CLIENT_ID || null });
};

const registerUser = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res
        .status(503)
        .json({ message: 'Database not connected. Please try again later.' });
    }

    const { name, email, password, phone, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      location: location || null,
    });

    res.status(201).json(getAuthResponse(user));
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// @desc Login user
// @route POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res
        .status(503)
        .json({ message: 'Database not connected. Please try again later.' });
    }

    const { email, password, phone, location } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    // Update phone/location if provided during login
    if (phone || location) {
      if (phone) user.phone = phone;
      if (location) user.location = location;
      await user.save();
    }

    res.json(getAuthResponse(user));
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// @desc Sign in with Google
// @route POST /api/auth/google
// @access Public
const loginWithGoogle = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ message: 'Database not connected. Please try again later.' });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({ message: 'Google sign-in is not configured on the server.' });
    }

    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Google credential is required' });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email || !payload.email_verified) {
      return res.status(401).json({ message: 'Google account could not be verified' });
    }

    let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }] });

    if (!user) {
      user = await User.create({
        name: payload.name || payload.email.split('@')[0],
        email: payload.email.toLowerCase(),
        password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10),
        googleId: payload.sub,
      });
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      await user.save();
    }

    res.json(getAuthResponse(user));
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ message: 'Google sign-in failed' });
  }
};

// @desc Get user profile
// @route GET /api/auth/profile
// @access Private
const getProfile = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res
        .status(503)
        .json({ message: 'Database not connected. Please try again later.' });
    }

    const user = await User.findById(req.user._id).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// @desc Update user profile
// @route PUT /api/auth/update-profile
// @access Private
const updateProfile = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res
        .status(503)
        .json({ message: 'Database not connected. Please try again later.' });
    }

    const { phone, location } = req.body;
    const update = {};

    if (phone !== undefined) {
      update.phone = phone || null;
    }
    if (location !== undefined) {
      update.location = location || null;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      update,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Updated user:', user);
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  loginWithGoogle,
  getGoogleClientId,
  getProfile,
  updateProfile,
};
