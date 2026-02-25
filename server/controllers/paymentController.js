const asyncHandler = require('express-async-handler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Create Stripe Payment Intent
// @route   POST /api/payment/create-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
    const { amount } = req.body; // amount in INR (rupees)

    if (!amount || amount <= 0) {
        res.status(400);
        throw new Error('Invalid amount');
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects amount in smallest currency unit (paise)
        currency: 'inr',
        automatic_payment_methods: { enabled: true },
        metadata: {
            userId: req.user._id.toString(),
        },
    });

    res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
    });
});

// @desc    Confirm Stripe Payment (verify on server side)
// @route   POST /api/payment/confirm
// @access  Private
const confirmPayment = asyncHandler(async (req, res) => {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
        res.status(400);
        throw new Error('Payment Intent ID is required');
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
        res.json({
            success: true,
            message: 'Payment verified successfully',
            paymentIntentId: paymentIntent.id,
            paymentStatus: paymentIntent.status,
            amount: paymentIntent.amount / 100,
        });
    } else {
        res.status(400);
        throw new Error(`Payment not successful. Status: ${paymentIntent.status}`);
    }
});

module.exports = { createPaymentIntent, confirmPayment };
