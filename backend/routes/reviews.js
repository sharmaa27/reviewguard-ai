const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const classifier = require('../services/classifier');

// Submit review - ML checks authenticity
router.post('/', async (req, res) => {
    try {
        const { text, rating, productId, reviewerName } = req.body;

        if (!text || text.trim().length < 10) {
            return res.status(400).json({ success: false, error: 'Review must be at least 10 characters' });
        }
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, error: 'Rating must be 1-5' });
        }
        
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

        // 🤖 ML Classification
        console.log('🔍 Classifying review...');
        const ml = await classifier.classify(text.trim());
        console.log('📊 Result:', ml);

        const review = new Review({
            text: text.trim(),
            rating: parseInt(rating),
            product: productId,
            reviewerName: reviewerName?.trim() || 'Anonymous',
            classification: { prediction: ml.prediction, confidence: ml.confidence, isAuthentic: ml.is_authentic },
            isVisible: ml.is_authentic
        });

        await review.save();

        if (ml.is_authentic) {
            res.status(201).json({
                success: true,
                isAuthentic: true,
                message: '✓ Your review has been published!',
                review: { id: review._id, text: review.text, rating: review.rating, reviewerName: review.reviewerName, createdAt: review.createdAt },
                confidence: Math.round(ml.confidence * 100)
            });
        } else {
            res.json({
                success: false,
                isAuthentic: false,
                message: '✗ Review rejected - detected as potentially fake or spam',
                confidence: Math.round(ml.confidence * 100),
                tip: 'Write a genuine review based on your actual experience'
            });
        }
    } catch (err) {
        console.error('Review error:', err);
        res.status(500).json({ success: false, error: 'Failed to process review' });
    }
});

// Get reviews for product
router.get('/product/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId, isVisible: true }).sort({ createdAt: -1 });
        res.json({ success: true, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Analyze without saving
router.post('/analyze', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || text.length < 5) return res.status(400).json({ success: false, error: 'Text required' });
        
        const result = await classifier.classify(text);
        res.json({ success: true, ...result, confidence: Math.round(result.confidence * 100) });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Stats
router.get('/stats', async (req, res) => {
    try {
        const [total, genuine, fake] = await Promise.all([
            Review.countDocuments(),
            Review.countDocuments({ 'classification.isAuthentic': true }),
            Review.countDocuments({ 'classification.isAuthentic': false })
        ]);
        res.json({ success: true, data: { total, genuine, fake, fakeRate: total ? ((fake/total)*100).toFixed(1) : 0 } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
