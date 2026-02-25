const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const sendEmail = require('../utils/sendEmail');

// @desc    Create order
// @route   POST /api/orders/create
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { items, shippingAddress, paymentMethod, subtotal, discount, shippingPrice, totalPrice, couponCode, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('No order items');
    }

    // Validate stock
    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) { res.status(404); throw new Error(`Product not found: ${item.product}`); }
        if (product.stock < item.qty) { res.status(400); throw new Error(`Insufficient stock for ${product.name}`); }
        // Deduct stock
        product.stock -= item.qty;
        await product.save();
    }

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    const order = await Order.create({
        user: req.user._id,
        items,
        shippingAddress,
        paymentMethod,
        paymentStatus: paymentMethod === 'Razorpay' ? 'Paid' : 'Pending',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        subtotal,
        discount: discount || 0,
        shippingPrice: shippingPrice || 0,
        totalPrice,
        couponCode,
        estimatedDelivery,
        orderStatus: 'Placed',
    });

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // Send confirmation email
    try {
        const User = require('../models/userModel');
        const user = await User.findById(req.user._id);
        await sendEmail({
            to: user.email,
            subject: `NOIR MAN - Order Confirmed #${order._id.toString().slice(-8).toUpperCase()}`,
            html: generateOrderEmailHtml(order, user),
        });
    } catch (e) {
        console.error('Email error:', e.message);
    }

    res.status(201).json({ success: true, order });
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 });
    res.json({ success: true, orders });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images category');
    if (!order) { res.status(404); throw new Error('Order not found'); }
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403); throw new Error('Not authorized');
    }
    res.json({ success: true, order });
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Admin
const getAllOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
        Order.find({}).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        Order.countDocuments(),
    ]);
    res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) { res.status(404); throw new Error('Order not found'); }
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (orderStatus === 'Delivered') order.deliveredAt = new Date();
    await order.save();
    res.json({ success: true, order });
});

// @desc    Get admin stats
// @route   GET /api/orders/stats
// @access  Admin
const getAdminStats = asyncHandler(async (req, res) => {
    const [totalOrders, revenueData, totalUsers, totalProducts] = await Promise.all([
        Order.countDocuments(),
        Order.aggregate([{ $match: { paymentStatus: 'Paid' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
        require('../models/userModel').countDocuments(),
        Product.countDocuments(),
    ]);
    res.json({
        success: true,
        totalOrders,
        totalRevenue: revenueData[0]?.total || 0,
        totalUsers,
        totalProducts,
    });
});

// Helper: Generate Order Confirmation Email HTML
const generateOrderEmailHtml = (order, user) => `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: 'Barlow', Arial, sans-serif; background: #0a0a0a; color: #f5f0eb; }
  .container { max-width: 600px; margin: 0 auto; padding: 24px; }
  .logo { font-family: serif; font-size: 28px; color: #c9a84c; letter-spacing: 4px; text-align: center; margin-bottom: 24px; }
  .card { background: #1e1a18; border: 1px solid rgba(201,168,76,0.2); border-radius: 8px; padding: 24px; margin-bottom: 16px; }
  .gold { color: #c9a84c; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid rgba(201,168,76,0.1); }
  th { color: #c9a84c; font-size: 12px; text-transform: uppercase; }
</style></head>
<body>
<div class="container">
  <div class="logo">✦ NOIR MAN ✦</div>
  <div class="card">
    <h2 style="margin-top:0">Order Confirmed! 🎉</h2>
    <p>Hello <strong>${user.name}</strong>, your order has been placed successfully.</p>
    <p>Order ID: <span class="gold">#${order._id.toString().slice(-8).toUpperCase()}</span></p>
    <p>Estimated Delivery: <strong>${new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}</strong></p>
  </div>
  <div class="card">
    <h3 style="margin-top:0; color: #c9a84c;">Order Summary</h3>
    <table>
      <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
      ${order.items.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>₹${i.price}</td></tr>`).join('')}
    </table>
    <hr style="border-color: rgba(201,168,76,0.2); margin: 12px 0;">
    <p style="text-align:right; font-size: 18px;">Total: <span class="gold">₹${order.totalPrice}</span></p>
  </div>
</div>
</body>
</html>`;

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, getAdminStats };
