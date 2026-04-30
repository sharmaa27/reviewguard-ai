import React from 'react';
import { Star, CheckCircle, User, Calendar } from 'lucide-react';

const ReviewItem = ({ review }) => {
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="review-item">
            <div className="review-header">
                <div className="reviewer-info">
                    <div className="avatar">
                        <User size={18} />
                    </div>
                    <div>
                        <div className="reviewer-name">
                            {review.reviewerName}
                            <span className="verified-badge">
                                <CheckCircle size={12} /> Verified
                            </span>
                        </div>
                        <div className="review-meta">
                            <span className="review-date">
                                <Calendar size={12} />
                                {formatDate(review.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="review-rating">
                    <div className="stars">
                        {[...Array(5)].map((_, i) => (
                            <Star 
                                key={i} 
                                size={12} 
                                fill={i < review.rating ? '#fbbf24' : 'none'}
                                stroke={i < review.rating ? '#fbbf24' : '#d1d5db'}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <p className="review-text">{review.text}</p>
            {review.classification && (
                <div className="review-ai-badge">
                    <CheckCircle size={12} />
                    AI Verified ({Math.round(review.classification.confidence * 100)}%)
                </div>
            )}
        </div>
    );
};

const ReviewList = ({ reviews }) => {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="reviews-list">
                <h3 className="reviews-title">Customer Reviews</h3>
                <div className="no-reviews">
                    <p>No reviews yet. Be the first to review!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="reviews-list">
            <h3 className="reviews-title">
                Customer Reviews <span className="review-count">({reviews.length})</span>
            </h3>
            <div className="reviews-container">
                {reviews.map((review) => (
                    <ReviewItem key={review._id} review={review} />
                ))}
            </div>
        </div>
    );
};

export default ReviewList;
