require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

const products = [
    {
        name: 'Midnight Black Linen Shirt',
        description: 'Premium linen shirt with a relaxed fit. Perfect for the modern gentleman. Breathable, lightweight, and effortlessly stylish.',
        price: 4999, discountPrice: 3999, category: 'Shirts',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Black', 'Navy'], stock: 50,
        images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600'],
        isFeatured: true, isBestSeller: true, tags: ['linen', 'casual', 'summer'],
    },
    {
        name: 'Obsidian Slim-Fit Trousers',
        description: 'Tailored slim-fit trousers crafted from premium wool blend. A wardrobe staple for every modern man.',
        price: 6999, discountPrice: 5499, category: 'Pants',
        sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Charcoal', 'Navy'], stock: 35,
        images: ['https://images.unsplash.com/photo-1594938298603-3d7c6e3f3b92?w=600'],
        isFeatured: true, tags: ['trousers', 'formal', 'slim-fit'],
    },
    {
        name: 'Noir Classic Three-Piece Suit',
        description: 'A magnificent three-piece suit that exudes power and elegance. Made from Italian wool with a silk lining.',
        price: 24999, discountPrice: 19999, category: 'Suits',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Black', 'Charcoal'], stock: 15,
        images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'],
        isFeatured: true, isBestSeller: true, tags: ['suit', 'formal', 'premium'],
    },
    {
        name: 'Gold-Dial Dress Watch',
        description: 'An elegant timepiece with a gold dial and genuine leather strap. Swiss quartz movement, water resistant.',
        price: 12999, discountPrice: 9999, category: 'Watches',
        sizes: [], colors: ['Gold', 'Silver'], stock: 25,
        images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600'],
        isFeatured: true, tags: ['watch', 'luxury', 'accessories'],
    },
    {
        name: 'Cashmere Turtleneck Sweater',
        description: 'Pure cashmere turtleneck sweater. Supremely soft, warm, and luxurious. A timeless piece for the cooler seasons.',
        price: 8999, discountPrice: 7499, category: 'Shirts',
        sizes: ['S', 'M', 'L', 'XL'], colors: ['Cream', 'Black', 'Navy'], stock: 30,
        images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600'],
        isBestSeller: true, tags: ['cashmere', 'sweater', 'luxury'],
    },
    {
        name: 'Leather Biker Jacket',
        description: 'Premium full-grain leather biker jacket with YKK zippers and quilted lining. An iconic addition to any wardrobe.',
        price: 18999, discountPrice: 15999, category: 'Jackets',
        sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Dark Brown'], stock: 20,
        images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600'],
        isFeatured: true, tags: ['leather', 'jacket', 'biker'],
    },
    {
        name: 'Oxford Brogue Leather Shoes',
        description: 'Hand-crafted Oxford brogue shoes in full-grain leather with a Goodyear welt construction. Timeless elegance.',
        price: 11999, discountPrice: 9499, category: 'Shoes',
        sizes: ['7', '8', '9', '10', '11'], colors: ['Black', 'Tan'], stock: 18,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
        isBestSeller: true, tags: ['shoes', 'oxford', 'brogue'],
    },
    {
        name: 'Mercerized Cotton T-Shirt',
        description: 'Elevated basics — mercerized cotton gives this t-shirt an unmistakable sheen and buttery softness.',
        price: 2499, discountPrice: 1999, category: 'T-Shirts',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], colors: ['White', 'Black', 'Grey', 'Navy'], stock: 80,
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'],
        isBestSeller: true, tags: ['t-shirt', 'basic', 'cotton'],
    },
    {
        name: 'Italian Silk Necktie',
        description: 'Hand-rolled Italian silk necktie with a subtle jacquard pattern. The finishing touch to any formal outfit.',
        price: 3999, discountPrice: 2999, category: 'Accessories',
        sizes: [], colors: ['Black', 'Navy', 'Burgundy', 'Gold'], stock: 60,
        images: ['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600'],
        tags: ['necktie', 'silk', 'accessories'],
    },
    {
        name: 'Tailored Pinstripe Suit',
        description: 'A bold pinstripe suit for the man who commands the room. Slim-fit with double-vent jacket.',
        price: 21999, discountPrice: 17999, category: 'Suits',
        sizes: ['S', 'M', 'L', 'XL'], colors: ['Charcoal', 'Navy'], stock: 12,
        images: ['https://images.unsplash.com/photo-1467519583593-1b40e8da01e3?w=600'],
        isFeatured: true, tags: ['suit', 'pinstripe', 'formal'],
    },
    {
        name: 'Slim Chino Pants',
        description: 'Versatile slim-fit chino pants in a stretch cotton blend. Dress up or down with ease.',
        price: 3999, discountPrice: 2999, category: 'Pants',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Khaki', 'Navy', 'Olive', 'Black'], stock: 55,
        images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600'],
        tags: ['chinos', 'casual', 'versatile'],
    },
    {
        name: 'Premium Leather Belt',
        description: 'Full-grain leather belt with brushed gunmetal buckle. Width 35mm. Pairs perfectly with our trousers.',
        price: 2999, discountPrice: 2499, category: 'Accessories',
        sizes: [], colors: ['Black', 'Tan', 'Dark Brown'], stock: 45,
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'],
        isBestSeller: true, tags: ['belt', 'leather', 'accessories'],
    },
    {
        name: 'French Terry Hoodie',
        description: 'Luxuriously soft French terry cotton hoodie with a clean, minimalist design. No logos, just quality.',
        price: 5499, discountPrice: 4299, category: 'Jackets',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Black', 'Grey Marl', 'Navy'], stock: 40,
        images: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600'],
        tags: ['hoodie', 'casual', 'comfort'],
    },
    {
        name: 'Suede Chelsea Boots',
        description: 'Suede Chelsea boots with an elastic side panel and leather sole. Sleek, sophisticated, and incredibly comfortable.',
        price: 9999, discountPrice: 7999, category: 'Shoes',
        sizes: ['7', '8', '9', '10', '11'], colors: ['Black', 'Tan', 'Dark Green'], stock: 22,
        images: ['https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600'],
        isFeatured: true, tags: ['chelsea boots', 'suede', 'shoes'],
    },
    {
        name: 'Structured Baseball Cap',
        description: 'Premium structured baseball cap in 100% wool felt. Adjustable leather strap back closure.',
        price: 1999, discountPrice: 1599, category: 'Accessories',
        sizes: [], colors: ['Black', 'Navy', 'Camel'], stock: 70,
        images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600'],
        tags: ['cap', 'accessories', 'casual'],
    },
    {
        name: 'Merino Wool Polo Shirt',
        description: 'A refined polo shirt crafted from 100% merino wool. Natural temperature regulation meets classic style.',
        price: 6999, discountPrice: 5499, category: 'Shirts',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], colors: ['Navy', 'Black', 'Burgundy', 'Forest Green'], stock: 35,
        images: ['https://images.unsplash.com/photo-1559563458-527698bf5295?w=600'],
        isBestSeller: true, tags: ['polo', 'merino', 'smart casual'],
    },
    {
        name: 'Silk-Blend Pocket Square',
        description: 'An exquisite silk-blend pocket square with hand-rolled edges. Elevate any suit or blazer instantly.',
        price: 1499, discountPrice: 1199, category: 'Accessories',
        sizes: [], colors: ['White', 'Ivory', 'Light Blue', 'Gold'], stock: 100,
        images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600'],
        tags: ['pocket square', 'accessories', 'silk'],
    },
    {
        name: 'Overcoat in Wool-Cashmere',
        description: 'A dramatic double-breasted overcoat in a premium wool-cashmere blend. The ultimate winter luxury.',
        price: 29999, discountPrice: 24999, category: 'Jackets',
        sizes: ['S', 'M', 'L', 'XL'], colors: ['Camel', 'Black', 'Charcoal'], stock: 10,
        images: ['https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600'],
        isFeatured: true, tags: ['overcoat', 'cashmere', 'luxury', 'winter'],
    },
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Product.deleteMany({});
        console.log('🗑️  Cleared products');

        // Insert products
        const created = await Product.insertMany(products);
        console.log(`✅ Seeded ${created.length} products`);

        // Create admin user if not exists
        const adminExists = await User.findOne({ email: 'admin@noirman.com' });
        if (!adminExists) {
            await User.create({
                name: 'NOIR MAN Admin',
                email: 'admin@noirman.com',
                password: 'Admin@123',
                role: 'admin',
            });
            console.log('✅ Admin user created: admin@noirman.com / Admin@123');
        } else {
            console.log('ℹ️  Admin user already exists');
        }

        console.log('🎉 Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err);
        process.exit(1);
    }
};

seed();
