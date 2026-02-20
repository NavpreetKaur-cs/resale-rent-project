const express = require('express');
const router = express.Router();
const {
    getAllClothing,
    getClothingById,
    addClothing,
    updateClothing,
    deleteClothing
} = require('../controllers/clothingController');

const { protect } = require('../middleware/authMiddleware');


router.get('/', getAllClothing);
router.get('/:id', getClothingById);


router.post('/', protect, addClothing);
router.put('/:id', protect, updateClothing);
router.delete('/:id', protect, deleteClothing);

module.exports = router;