const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, getAdminStats } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/create', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/stats', adminOnly, getAdminStats);
router.get('/', adminOnly, getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', adminOnly, updateOrderStatus);

module.exports = router;
