const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    text: { type: String, required: true, minlength: 10 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    reviewerName: { type: String, default: 'Anonymous' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    classification: {
        prediction: { type: String, enum: ['Genuine', 'Fake'] },
        confidence: { type: Number },
        isAuthentic: { type: Boolean }
    },
    isVisible: { type: Boolean, default: true }
}, { timestamps: true });

reviewSchema.index({ product: 1, isVisible: 1 });

module.exports = mongoose.model('Review', reviewSchema);
