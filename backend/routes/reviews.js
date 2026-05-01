const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const classifier = require('../services/classifier');
const qualityAnalyzer = require('../services/qualityAnalyzer');
const { auth } = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
    try {
        const { text, rating, productId } = req.body;

        if (!text || text.trim().length < 10) {
            return res.status(400).json({ success: false, error: 'Review must be at least 10 characters' });
        }
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, error: 'Rating must be 1-5' });
        }
        
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

        const cleanText = text.trim();

        console.log('📋 Running quality analysis...');
        const qualityResult = qualityAnalyzer.analyzeQuality(cleanText);
        console.log('📋 Quality:', JSON.stringify(qualityResult));

        console.log('🤖 Running ML classification...');
        const mlResult = await classifier.classify(cleanText);
        console.log('🤖 ML:', JSON.stringify(mlResult));

        const verdict = qualityAnalyzer.combinedVerdict(mlResult, qualityResult);
        console.log('⚖️ Verdict:', JSON.stringify(verdict));

        const review = new Review({
            text: cleanText,
            rating: parseInt(rating),
            product: productId,
            reviewerName: req.user.name,
            user: req.user._id,
            classification: {
                prediction: verdict.prediction,
                confidence: verdict.confidence,
                isAuthentic: verdict.isAuthentic
            },
            isVisible: verdict.isAuthentic
        });

        await review.save();

        if (verdict.isAuthentic) {
            res.status(201).json({
                success: true,
                isAuthentic: true,
                message: '✓ Your review has been published!',
                review: { id: review._id, text: review.text, rating: review.rating, reviewerName: review.reviewerName, createdAt: review.createdAt },
                confidence: Math.round(verdict.confidence * 100),
                analysis: verdict.layers
            });
        } else {
            let tip = 'Write a detailed review based on your actual experience';
            if (qualityResult.issues.length > 0) {
                const issue = qualityResult.issues[0];
                if (issue.includes('short')) tip = 'Write a longer, more detailed review describing your experience';
                else if (issue.includes('repetitive')) tip = 'Avoid repeating the same words — describe specific features';
                else if (issue.includes('spam')) tip = 'Use natural language instead of promotional phrases';
                else if (issue.includes('No specific')) tip = 'Mention specific product features, how you used it, or compare it to alternatives';
                else if (issue.includes('opinion')) tip = 'Add specific details about what you liked or disliked and why';
            }

            res.json({
                success: false,
                isAuthentic: false,
                message: '✗ Review rejected - detected as potentially fake or spam',
                confidence: Math.round(verdict.confidence * 100),
                tip,
                reason: verdict.reason,
                analysis: verdict.layers
            });
        }
    } catch (err) {
        console.error('Review error:', err);
        res.status(500).json({ success: false, error: 'Failed to process review' });
    }
});

router.get('/product/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId, isVisible: true }).sort({ createdAt: -1 });
        res.json({ success: true, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/analyze', auth, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || text.length < 5) return res.status(400).json({ success: false, error: 'Text required' });
        
        const qualityResult = qualityAnalyzer.analyzeQuality(text);
        const mlResult = await classifier.classify(text);
        const verdict = qualityAnalyzer.combinedVerdict(mlResult, qualityResult);

        res.json({ success: true, ...verdict, confidence: Math.round(verdict.confidence * 100) });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

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