const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Product name is required'], trim: true },
        description: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        discountPrice: { type: Number, default: 0 },
        category: {
            type: String,
            required: true,
            enum: ['Shirts', 'Pants', 'Suits', 'Accessories', 'Jackets', 'T-Shirts', 'Shoes', 'Watches'],
        },
        sizes: [{ type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '7', '8', '9', '10', '11', 'One Size'] }],
        colors: [{ type: String }],
        images: [{ type: String }], // Cloudinary URLs
        stock: { type: Number, required: true, default: 0 },
        ratings: { type: Number, default: 0 },
        numReviews: { type: Number, default: 0 },
        isFeatured: { type: Boolean, default: false },
        isBestSeller: { type: Boolean, default: false },
        tags: [String],
    },
    { timestamps: true }
);

// Text index for search
productSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
