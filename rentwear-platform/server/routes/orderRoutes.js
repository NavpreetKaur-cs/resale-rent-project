const express = require('express');
const router = express.Router();
const { placeOrder, getUserOrders, updateOrderStatus, getSellerOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, placeOrder);
router.get('/my-orders', protect, getUserOrders);
router.get('/seller-orders', protect, getSellerOrders);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;