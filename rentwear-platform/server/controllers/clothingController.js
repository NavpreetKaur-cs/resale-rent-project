const Clothing = require('../models/Clothing');
const mongoose = require('mongoose');

// Check database connection
const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

// @desc Get all clothing items
// @route GET /api/clothing
// @access Public
const getAllClothing = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res
        .status(503)
        .json({ message: 'Database not connected. Please try again later.' });
    }

    const { category, type, maxPrice, minPrice } = req.query;
    let filter = {
      available: true  // Only show available items
    };

    if (category) filter.category = category;
    if (type) filter.type = type;

    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);

    console.log('Fetching clothing with filter:', filter);

    const clothes = await Clothing.find(filter).populate(
      'seller',
      'name location rating'
    ).sort({ createdAt: -1 });  // Show newest items first
    
    console.log('Found items:', clothes.length);
    res.json(clothes);
  } catch (error) {
    console.error('Error fetching clothing:', error.message);
    res.status(500).json({ message: 'Failed to fetch clothing items' });
  }
};

// @desc Get single clothing item by ID
// @route GET /api/clothing/:id
// @access Public
const getClothingById = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res
        .status(503)
        .json({ message: 'Database not connected. Please try again later.' });
    }

    const clothing = await Clothing.findById(req.params.id).populate(
      'seller',
      'name location rating'
    );
    if (!clothing)
      return res.status(404).json({ message: 'Clothing not found' });

    res.json(clothing);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch clothing item' });
  }
};

// @desc Add new clothing item
// @route POST /api/clothing
// @access Protected
const addClothing = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res
        .status(503)
        .json({ message: 'Database not connected. Please try again later.' });
    }

    console.log('Adding clothing - User:', req.user ? req.user._id : 'NO USER');
    console.log('Request body:', req.body);

    const {
      title,
      category,
      type,
      price,
      deposit,
      description,
      size,
      brand,
      condition,
      images,
    } = req.body;

    if (!req.user) return res.status(401).json({ message: 'User not authenticated' });
    if (!title || !category || !type || !Number.isFinite(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ message: 'Valid title, category, type, and non-negative price are required' });
    }

    // Rental restrictions
    if (
      type === 'rental' &&
      !(category === 'ethnic' || category === 'wedding')
    ) {
      return res.status(400).json({
        message: 'Rental only allowed for ethnic or wedding category',
      });
    }

    const clothing = new Clothing({
      title,
      category,
      type,
      price: Number(price),
      deposit: type === 'rental' ? Math.max(0, Number(deposit) || 0) : 0,
      description,
      size,
      brand,
      condition,
      images,
      seller: req.user._id,
      available: true  // Explicitly set available to true
    });

    const savedClothing = await clothing.save();
    console.log('Clothing saved:', savedClothing._id, savedClothing.title);
    res.status(201).json(savedClothing);
  } catch (error) {
    console.error('Error adding clothing:', error.message);
    res.status(500).json({ message: 'Failed to add clothing item', error: error.message });
  }
};

// @desc Update clothing item
// @route PUT /api/clothing/:id
// @access Protected (seller only)
const updateClothing = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res
        .status(503)
        .json({ message: 'Database not connected. Please try again later.' });
    }

    const clothing = await Clothing.findById(req.params.id);
    if (!clothing)
      return res.status(404).json({ message: 'Clothing not found' });

    // Only seller can update
    if (clothing.seller.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to update this item' });
    }

    const allowedFields = ['title', 'category', 'type', 'price', 'deposit', 'description', 'size', 'brand', 'condition', 'images', 'available'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );
    if (updates.price !== undefined) {
      updates.price = Number(updates.price);
      if (!Number.isFinite(updates.price) || updates.price < 0) {
        return res.status(400).json({ message: 'Price must be a non-negative number' });
      }
    }
    if (updates.deposit !== undefined) {
      updates.deposit = Number(updates.deposit);
      if (!Number.isFinite(updates.deposit) || updates.deposit < 0) {
        return res.status(400).json({ message: 'Deposit must be a non-negative number' });
      }
    }

    // Prevent rental category abuse
    if (
      (updates.type || clothing.type) === 'rental' &&
      !((updates.category || clothing.category) === 'ethnic' || (updates.category || clothing.category) === 'wedding')
    ) {
      return res.status(400).json({
        message: 'Rental only allowed for ethnic or wedding category',
      });
    }

    Object.assign(clothing, updates);
    const updatedClothing = await clothing.save();
    res.json(updatedClothing);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update clothing item' });
  }
};

// @desc Delete clothing item
// @route DELETE /api/clothing/:id
// @access Protected (seller only)
const deleteClothing = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res
        .status(503)
        .json({ message: 'Database not connected. Please try again later.' });
    }

    const clothing = await Clothing.findById(req.params.id);
    if (!clothing)
      return res.status(404).json({ message: 'Clothing not found' });

    if (clothing.seller.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this item' });
    }

    await Clothing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Clothing item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete clothing item' });
  }
};

module.exports = {
  getAllClothing,
  getClothingById,
  addClothing,
  updateClothing,
  deleteClothing,
};
