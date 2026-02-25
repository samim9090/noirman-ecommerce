const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true, trim: true },
        discountPercent: { type: Number, required: true, min: 1, max: 100 },
        maxDiscount: { type: Number, default: 0 }, // 0 = no cap
        minOrderAmount: { type: Number, default: 0 },
        expiresAt: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
        usageLimit: { type: Number, default: 0 }, // 0 = unlimited
        usedCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
