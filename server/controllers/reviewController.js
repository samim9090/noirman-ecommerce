const asyncHandler = require('express-async-handler');
const Review = require('../models/reviewModel');
const Product = require('../models/productModel');

// @desc    Add review
// @route   POST /api/products/:id/reviews
// @access  Private
const addReview = asyncHandler(async (req, res) => {
    const { rating, comment, title } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) { res.status(404); throw new Error('Product not found'); }

    const existing = await Review.findOne({ user: req.user._id, product: productId });
    if (existing) { res.status(400); throw new Error('You have already reviewed this product'); }

    const review = await Review.create({ user: req.user._id, product: productId, rating, comment, title });

    // Recalculate product rating
    const reviews = await Review.find({ product: productId });
    product.numReviews = reviews.length;
    product.ratings = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await product.save();

    await review.populate('user', 'name');
    res.status(201).json({ success: true, review });
});

// @desc    Get reviews for product
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ product: req.params.id })
        .populate('user', 'name')
        .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
});

module.exports = { addReview, getProductReviews };
