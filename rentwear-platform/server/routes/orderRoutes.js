const express = require('express');
const router = express.Router();
const { placeOrder, getUserOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, placeOrder);
router.get('/my-orders', protect, getUserOrders);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;