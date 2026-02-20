const Order = require('../models/Order');
const Clothing = require('../models/Clothing');
const mongoose = require('mongoose');

// Check database connection
const isDBConnected = () => {
    return mongoose.connection.readyState === 1;
};

// @desc    Place order (resale or rental)
// @route   POST /api/orders
// @access  Protected
const placeOrder = async (req, res) => {
    try {
        if (!isDBConnected()) {
            return res.status(503).json({ message: 'Database not connected. Please try again later.' });
        }

        const { productId, orderType, rentalDays } = req.body;

        const product = await Clothing.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (orderType !== product.type) {
            return res.status(400).json({ message: 'Order type mismatch' });
        }

        if (!product.available) {
            return res.status(400).json({ message: 'Product not available' });
        }

        let amount = product.price;
        let deposit = 0;
        let dueDate = null;

        if (orderType === 'rental') {
            if (!(product.category === 'ethnic' || product.category === 'wedding')) {
                return res.status(400).json({ message: 'Rental only allowed for ethnic or wedding category' });
            }
            deposit = product.deposit;
            dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + (rentalDays || 1));
        }

        const order = new Order({
            buyer: req.user._id,
            product: product._id,
            orderType,
            amount,
            deposit,
            dueDate,
            status: 'pending'
        });

        // Mark product unavailable
        product.available = false;
        await product.save();
        const savedOrder = await order.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Failed to place order' });
    }
};

// @desc    Get orders for logged-in user
// @route   GET /api/orders/my-orders
// @access  Protected
const getUserOrders = async (req, res) => {
    try {
        if (!isDBConnected()) {
            return res.status(503).json({ message: 'Database not connected. Please try again later.' });
        }

        const orders = await Order.find({ buyer: req.user._id }).populate('product');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
};

// @desc    Update order status (return, complete)
// @route   PUT /api/orders/:id/status
// @access  Protected
const updateOrderStatus = async (req, res) => {
    try {
        if (!isDBConnected()) {
            return res.status(503).json({ message: 'Database not connected. Please try again later.' });
        }

        const { status } = req.body;
        const order = await Order.findById(req.params.id).populate('product');

        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Update returnDate & lateFee if rental
        if (order.orderType === 'rental' && status === 'returned') {
            order.returnDate = new Date();
            if (order.dueDate && order.returnDate > order.dueDate) {
                const lateDays = Math.ceil((order.returnDate - order.dueDate) / (1000*60*60*24));
                order.lateFee = lateDays * 50; // flat ₹50 per day
            }

            // Refund deposit minus lateFee
            order.deposit = order.deposit - (order.lateFee || 0);

            // Make product available again
            const product = await Clothing.findById(order.product._id);
            product.available = true;
            await product.save();
        }

        order.status = status;
        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update order status' });
    }
};

module.exports = {
    placeOrder,
    getUserOrders,
    updateOrderStatus
};