const Clothing = require('../models/Clothing');

// @desc    Get all clothing items
// @route   GET /api/clothing
// @access  Public
const getAllClothing = async (req, res) => {
    try {
        const { category, type, maxPrice, minPrice } = req.query;

        let filter = {};
        if (category) filter.category = category;
        if (type) filter.type = type;
        if (minPrice || maxPrice) filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);

        const clothes = await Clothing.find(filter).populate('seller', 'name location rating');
        res.json(clothes);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch clothing items' });
    }
};

// @desc    Get single clothing item by ID
// @route   GET /api/clothing/:id
// @access  Public
const getClothingById = async (req, res) => {
    try {
        const clothing = await Clothing.findById(req.params.id).populate('seller', 'name location rating');
        if (!clothing) return res.status(404).json({ message: 'Clothing not found' });
        res.json(clothing);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch clothing item' });
    }
};

// @desc    Add new clothing item
// @route   POST /api/clothing
// @access  Protected
const addClothing = async (req, res) => {
    try {
        const { title, category, type, price, deposit, description, size, brand, condition, images } = req.body;

        // Rental restrictions
        if (type === 'rental' && !(category === 'ethnic' || category === 'wedding')) {
            return res.status(400).json({ message: 'Rental only allowed for ethnic or wedding category' });
        }

        const clothing = new Clothing({
            title,
            category,
            type,
            price,
            deposit: type === 'rental' ? deposit : 0,
            description,
            size,
            brand,
            condition,
            images,
            seller: req.user._id
        });

        const savedClothing = await clothing.save();
        res.status(201).json(savedClothing);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add clothing item' });
    }
};

// @desc    Update clothing item
// @route   PUT /api/clothing/:id
// @access  Protected (seller only)
const updateClothing = async (req, res) => {
    try {
        const clothing = await Clothing.findById(req.params.id);
        if (!clothing) return res.status(404).json({ message: 'Clothing not found' });

        // Only seller can update
        if (clothing.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this item' });
        }

        const updates = req.body;
        // Prevent rental category abuse
        if (updates.type === 'rental' && !(updates.category === 'ethnic' || updates.category === 'wedding')) {
            return res.status(400).json({ message: 'Rental only allowed for ethnic or wedding category' });
        }

        Object.assign(clothing, updates);
        const updatedClothing = await clothing.save();
        res.json(updatedClothing);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update clothing item' });
    }
};

// @desc    Delete clothing item
// @route   DELETE /api/clothing/:id
// @access  Protected (seller only)
const deleteClothing = async (req, res) => {
    try {
        const clothing = await Clothing.findById(req.params.id);
        if (!clothing) return res.status(404).json({ message: 'Clothing not found' });

        if (clothing.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this item' });
        }

        await clothing.remove();
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
    deleteClothing
};