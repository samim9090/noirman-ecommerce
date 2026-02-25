const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    image: String,
    price: { type: Number, required: true },
    qty: { type: Number, required: true, default: 1 },
    size: String,
    color: String,
});

const shippingAddressSchema = new mongoose.Schema({
    fullName: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
});

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        items: [orderItemSchema],
        shippingAddress: shippingAddressSchema,
        paymentMethod: { type: String, enum: ['Razorpay', 'COD'], required: true },
        paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String,
        orderStatus: {
            type: String,
            enum: ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Placed',
        },
        subtotal: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        shippingPrice: { type: Number, default: 0 },
        totalPrice: { type: Number, required: true },
        couponCode: String,
        estimatedDelivery: Date,
        deliveredAt: Date,
        notes: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
