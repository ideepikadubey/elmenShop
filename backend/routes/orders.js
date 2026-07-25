const express = require('express');
const {
  placeOrder, getMyOrders, getOrder,
  getAllOrders, updateOrderStatus, getOrderTracking
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');

const router = express.Router();

// User routes
router.post('/track',      getOrderTracking);
router.post('/',          protect, placeOrder);
router.get('/my',         protect, getMyOrders);
router.get('/:id',        protect, getOrder);

// Admin routes
router.get('/',            protect, adminOnly, getAllOrders);
router.put('/:id/status',  protect, adminOnly, updateOrderStatus);

module.exports = router;

