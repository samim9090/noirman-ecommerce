const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// @desc    Get wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist', 'name price discountPrice images category ratings');
    res.json({ success: true, wishlist: user.wishlist });
});

// @desc    Add to wishlist
// @route   POST /api/wishlist/add/:productId
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user.wishlist.includes(req.params.productId)) {
        user.wishlist.push(req.params.productId);
        await user.save();
    }
    res.json({ success: true, message: 'Added to wishlist', wishlist: user.wishlist });
});

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/remove/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
    await user.save();
    res.json({ success: true, message: 'Removed from wishlist', wishlist: user.wishlist });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
