const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Review = require('../models/Review');

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        const result = await Promise.all(products.map(async p => {
            const stats = await Review.aggregate([
                { $match: { product: p._id, isVisible: true } },
                { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
            ]);
            return { ...p.toObject(), rating: stats[0]?.avg || 0, reviewCount: stats[0]?.count || 0 };
        }));
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get single product with reviews
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
        
        const reviews = await Review.find({ product: product._id, isVisible: true }).sort({ createdAt: -1 });
        const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
        
        res.json({ success: true, data: { ...product.toObject(), rating: avgRating, reviewCount: reviews.length, reviews } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Seed products
router.post('/seed', async (req, res) => {
    try {
        await Product.deleteMany({});
        const products = await Product.insertMany([
            { name: 'Sony WH-1000XM5 Wireless Headphones', description: 'Industry-leading noise cancellation with Auto NC Optimizer. Crystal clear hands-free calling.', price: 29990, category: 'Electronics', brand: 'Sony', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500' },
            { name: 'Samsung Galaxy S24 Ultra', description: '200MP camera, Snapdragon 8 Gen 3, 5000mAh battery with S Pen included.', price: 134999, category: 'Smartphones', brand: 'Samsung', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500' },
            { name: 'Nike Air Jordan 1 Retro High', description: 'Iconic style meets legendary comfort. Premium leather upper with Air-Sole unit.', price: 16995, category: 'Footwear', brand: 'Nike', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500' },
            { name: 'Apple MacBook Pro 14" M3 Pro', description: '12-core CPU, 18-core GPU, 18GB unified memory. Liquid Retina XDR display.', price: 199900, category: 'Laptops', brand: 'Apple', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500' },
            { name: 'Kindle Paperwhite 16GB', description: '6.8" display with adjustable warm light. Waterproof. Weeks of battery life.', price: 14999, category: 'Electronics', brand: 'Amazon', image: 'https://images.unsplash.com/photo-1594377157609-5c996118ac7f?w=500' },
            { name: 'boAt Rockerz 450 Headphones', description: '40mm drivers, 15 hours playback, soft padded ear cushions for comfort.', price: 1499, category: 'Electronics', brand: 'boAt', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' }
        ]);
        res.json({ success: true, message: `Seeded ${products.length} products`, data: products });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
