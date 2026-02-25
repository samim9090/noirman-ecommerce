const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const { cloudinary } = require('../middleware/uploadMiddleware');

// @desc    Get all products (with filters, search, sort, pagination)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const { category, size, color, minPrice, maxPrice, search, sort, page = 1, limit = 12, featured, bestSeller } = req.query;

    const query = {};

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (size) query.sizes = { $in: size.split(',') };
    if (color) query.colors = { $in: color.split(',') };
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (featured === 'true') query.isFeatured = true;
    if (bestSeller === 'true') query.isBestSeller = true;

    let sortObj = { createdAt: -1 };
    if (sort === 'price-asc') sortObj = { price: 1 };
    else if (sort === 'price-desc') sortObj = { price: -1 };
    else if (sort === 'rating') sortObj = { ratings: -1 };
    else if (sort === 'popular') sortObj = { numReviews: -1 };

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
        Product.find(query).sort(sortObj).skip(skip).limit(limitNum),
        Product.countDocuments(query),
    ]);

    res.json({
        success: true,
        products,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
    });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }
    res.json({ success: true, product });
});

// @desc    Create product (admin)
// @route   POST /api/products
// @access  Admin
const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, discountPrice, category, sizes, colors, stock, isFeatured, isBestSeller, tags } = req.body;
    const images = req.files ? req.files.map((f) => f.path) : [];

    const product = await Product.create({
        name, description, price, discountPrice, category,
        sizes: sizes ? JSON.parse(sizes) : [],
        colors: colors ? JSON.parse(colors) : [],
        images, stock, isFeatured, isBestSeller,
        tags: tags ? JSON.parse(tags) : [],
    });

    res.status(201).json({ success: true, product });
});

// @desc    Update product (admin)
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const { name, description, price, discountPrice, category, sizes, colors, stock, isFeatured, isBestSeller, tags, existingImages } = req.body;

    const newImages = req.files ? req.files.map((f) => f.path) : [];
    const keepImages = existingImages ? JSON.parse(existingImages) : product.images;
    const allImages = [...keepImages, ...newImages];

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.discountPrice = discountPrice !== undefined ? discountPrice : product.discountPrice;
    product.category = category || product.category;
    product.sizes = sizes ? JSON.parse(sizes) : product.sizes;
    product.colors = colors ? JSON.parse(colors) : product.colors;
    product.images = allImages;
    product.stock = stock !== undefined ? stock : product.stock;
    product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
    product.isBestSeller = isBestSeller !== undefined ? isBestSeller : product.isBestSeller;
    product.tags = tags ? JSON.parse(tags) : product.tags;

    const updated = await product.save();
    res.json({ success: true, product: updated });
});

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }
    // Remove images from Cloudinary
    for (const imageUrl of product.images) {
        const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
        try { await cloudinary.uploader.destroy(publicId); } catch (e) { }
    }
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
