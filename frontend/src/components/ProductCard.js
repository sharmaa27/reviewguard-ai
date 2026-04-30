import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MessageSquare, ArrowRight } from 'lucide-react';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="product-card" onClick={() => navigate(`/product/${product._id}`)}>
            <div className="product-image-wrapper">
                <img 
                    src={product.image || 'https://via.placeholder.com/400x300'} 
                    alt={product.name}
                    className="product-image"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/400x300'}
                />
                <div className="product-category-tag">{product.category}</div>
            </div>
            
            <div className="product-info">
                {product.brand && <div className="product-brand">{product.brand}</div>}
                <h3 className="product-name">{product.name}</h3>
                
                <div className="product-rating">
                    <div className="stars">
                        {[...Array(5)].map((_, i) => (
                            <Star 
                                key={i} 
                                size={14} 
                                fill={i < Math.round(product.rating) ? '#fbbf24' : 'none'}
                                stroke={i < Math.round(product.rating) ? '#fbbf24' : '#d1d5db'}
                            />
                        ))}
                    </div>
                    <span className="rating-value">{product.rating?.toFixed(1) || '0.0'}</span>
                    <span className="review-count">
                        <MessageSquare size={12} />
                        {product.reviewCount || 0}
                    </span>
                </div>
                
                <div className="product-footer">
                    <div className="product-price">{formatPrice(product.price)}</div>
                    <button className="view-btn">
                        View <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
