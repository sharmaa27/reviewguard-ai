import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Star, Loader2, Shield, AlertTriangle, CheckCircle2, Sparkles, LogIn } from 'lucide-react';
import { reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    if (!isAuthenticated) {
        return (
            <div className="review-form-container">
                <div className="form-header">
                    <Shield className="form-icon" size={24} />
                    <div>
                        <h3>Write a Review</h3>
                        <p>Login required to submit reviews</p>
                    </div>
                </div>
                <div className="login-prompt">
                    <p>You need to be logged in to write a review.</p>
                    <button className="submit-btn" onClick={() => navigate('/auth')}>
                        <LogIn size={18} /> Sign In to Review
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (text.length < 10 || rating === 0) return;
        
        setLoading(true);
        setResult(null);
        
        try {
            const res = await reviewAPI.submit({ 
                text, 
                rating, 
                productId
            });
            setResult(res.data);
            
            if (res.data.isAuthentic) {
                setText('');
                setRating(0);
                if (onReviewSubmitted) onReviewSubmitted();
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setResult({ success: false, message: 'Session expired. Please login again.' });
            } else {
                setResult({ success: false, message: 'Failed to submit review' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="review-form-container">
            <div className="form-header">
                <Shield className="form-icon" size={24} />
                <div>
                    <h3>Write a Review</h3>
                    <p>Reviewing as <strong>{user.name}</strong></p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="review-form">
                <div className="form-group">
                    <label>Rating</label>
                    <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="star-btn"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star
                                    size={28}
                                    fill={(hoverRating || rating) >= star ? '#fbbf24' : 'none'}
                                    stroke={(hoverRating || rating) >= star ? '#fbbf24' : '#d1d5db'}
                                />
                            </button>
                        ))}
                        {rating > 0 && (
                            <span className="rating-text">
                                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                            </span>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label>Your Review</label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Share your experience... (min 10 characters)"
                        className="form-textarea"
                        rows={4}
                    />
                    <div className="textarea-footer">
                        <span className={text.length < 10 ? 'char-count error' : 'char-count'}>
                            {text.length} characters
                        </span>
                    </div>
                </div>

                {result && (
                    <div className={`result-message ${result.isAuthentic ? 'success' : 'error'}`}>
                        {result.isAuthentic ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                        <div>
                            <strong>{result.message}</strong>
                            {result.tip && <p>{result.tip}</p>}
                            {result.confidence && <span className="confidence">AI Confidence: {result.confidence}%</span>}
                        </div>
                    </div>
                )}

                <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={loading || text.length < 10 || rating === 0}
                >
                    {loading ? (
                        <><Loader2 size={18} className="spin" /> Processing...</>
                    ) : (
                        <><Sparkles size={18} /> Submit Review <Send size={16} /></>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;
