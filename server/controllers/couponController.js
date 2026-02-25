const asyncHandler = require('express-async-handler');
const Coupon = require('../models/couponModel');

// @desc    Apply coupon
// @route   POST /api/coupons/apply
// @access  Private
const applyCoupon = asyncHandler(async (req, res) => {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) { res.status(404); throw new Error('Invalid coupon code'); }
    if (!coupon.isActive) { res.status(400); throw new Error('Coupon is no longer active'); }
    if (coupon.expiresAt < new Date()) { res.status(400); throw new Error('Coupon has expired'); }
    if (coupon.minOrderAmount > 0 && orderAmount < coupon.minOrderAmount) {
        res.status(400);
        throw new Error(`Minimum order amount of ₹${coupon.minOrderAmount} required`);
    }
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        res.status(400); throw new Error('Coupon usage limit reached');
    }

    let discount = (orderAmount * coupon.discountPercent) / 100;
    if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);

    res.json({
        success: true,
        discount: Math.round(discount),
        discountPercent: coupon.discountPercent,
        message: `Coupon applied! You save ₹${Math.round(discount)}`,
    });
});

// @desc    Create coupon (admin)
// @route   POST /api/coupons
// @access  Admin
const createCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
});

// @desc    Get all coupons (admin)
// @route   GET /api/coupons
// @access  Admin
const getAllCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json({ success: true, coupons });
});

// @desc    Toggle coupon active status (admin)
// @route   PUT /api/coupons/:id
// @access  Admin
const updateCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) { res.status(404); throw new Error('Coupon not found'); }
    res.json({ success: true, coupon });
});

// @desc    Delete coupon (admin)
// @route   DELETE /api/coupons/:id
// @access  Admin
const deleteCoupon = asyncHandler(async (req, res) => {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
});

module.exports = { applyCoupon, createCoupon, getAllCoupons, updateCoupon, deleteCoupon };
