const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist', 'name price discountPrice images');
    res.json({ success: true, user });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('+password');
    const { name, email, phone, password, newPassword } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    if (newPassword) {
        if (!password) { res.status(400); throw new Error('Current password is required'); }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) { res.status(401); throw new Error('Current password is incorrect'); }
        user.password = newPassword;
    }
    const updated = await user.save();
    res.json({ success: true, user: { _id: updated._id, name: updated.name, email: updated.email, phone: updated.phone, role: updated.role } });
});

// @desc    Add address
// @route   POST /api/users/address
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) {
        user.addresses.forEach(a => (a.isDefault = false));
    }
    user.addresses.push(req.body);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
});

// @desc    Delete address
// @route   DELETE /api/users/address/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.id);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
});

// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search } = req.query;
    const query = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
        User.find(query).select('-password').skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
        User.countDocuments(query),
    ]);
    res.json({ success: true, users, total, page: Number(page) });
});

// @desc    Block / unblock user (admin)
// @route   PUT /api/users/:id/block
// @access  Admin
const toggleBlockUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error('User not found'); }
    if (user.role === 'admin') { res.status(403); throw new Error('Cannot block admin'); }
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ success: true, isBlocked: user.isBlocked, message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}` });
});

module.exports = { getProfile, updateProfile, addAddress, deleteAddress, getAllUsers, toggleBlockUser };
