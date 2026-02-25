const asyncHandler = require('express-async-handler');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price discountPrice images stock');
    if (!cart) return res.json({ success: true, cart: { items: [] } });
    res.json({ success: true, cart });
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
    const { productId, qty = 1, size = 'M', color = '' } = req.body;
    const product = await Product.findById(productId);
    if (!product) { res.status(404); throw new Error('Product not found'); }
    if (product.stock < qty) { res.status(400); throw new Error('Insufficient stock'); }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existingIdx = cart.items.findIndex(
        (item) => item.product.toString() === productId && item.size === size && item.color === color
    );
    if (existingIdx > -1) {
        cart.items[existingIdx].qty += qty;
    } else {
        cart.items.push({ product: productId, qty, size, color });
    }
    await cart.save();
    await cart.populate('items.product', 'name price discountPrice images stock');
    res.json({ success: true, cart });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
    const { productId, qty, size, color } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) { res.status(404); throw new Error('Cart not found'); }

    const item = cart.items.find(
        (i) => i.product.toString() === productId && i.size === size && i.color === color
    );
    if (!item) { res.status(404); throw new Error('Item not in cart'); }

    if (qty <= 0) {
        cart.items = cart.items.filter(
            (i) => !(i.product.toString() === productId && i.size === size && i.color === color)
        );
    } else {
        item.qty = qty;
    }
    await cart.save();
    await cart.populate('items.product', 'name price discountPrice images stock');
    res.json({ success: true, cart });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
    const { size, color } = req.query;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) { res.status(404); throw new Error('Cart not found'); }

    cart.items = cart.items.filter(
        (item) => !(item.product.toString() === req.params.productId && item.size === size && item.color === color)
    );
    await cart.save();
    await cart.populate('items.product', 'name price discountPrice images stock');
    res.json({ success: true, cart });
});

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ success: true, message: 'Cart cleared' });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
