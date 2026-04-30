import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MessageSquare, Shield, Loader2, Package } from 'lucide-react';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import { productAPI } from '../services/api';

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProduct = async () => {
        try {
            const res = await productAPI.getById(id);
            setProduct(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    if (loading) {
        return (
            <div className="page-loading">
                <Loader2 size={48} className="spin" />
                <p>Loading...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="page-error">
                <Package size={64} />
                <h2>Product Not Found</h2>
                <button className="primary-btn" onClick={() => navigate('/')}>
                    <ArrowLeft size={16} /> Back
                </button>
            </div>
        );
    }

    return (
        <div className="product-page">
            <div className="container">
                <button className="back-btn" onClick={() => navigate('/')}>
                    <ArrowLeft size={18} /> Back to Products
                </button>
            </div>

            <div className="container product-detail">
                <div className="product-gallery">
                    <img 
                        src={product.image} 
                        alt={product.name} 
                        className="product-main-image"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/600x400'}
                    />
                    <div className="product-badges">
                        <span className="badge category">{product.category}</span>
                        {product.brand && <span className="badge brand">{product.brand}</span>}
                    </div>
                </div>

                <div className="product-details">
                    <h1 className="product-title">{product.name}</h1>
                    
                    <div className="product-rating-large">
                        <div className="stars">
                            {[...Array(5)].map((_, i) => (
                                <Star 
                                    key={i} 
                                    size={18} 
                                    fill={i < Math.round(product.rating) ? '#fbbf24' : 'none'}
                                    stroke={i < Math.round(product.rating) ? '#fbbf24' : '#d1d5db'}
                                />
                            ))}
                        </div>
                        <span className="rating-num">{product.rating?.toFixed(1) || '0.0'}</span>
                        <span className="review-count">
                            <MessageSquare size={16} /> {product.reviewCount} reviews
                        </span>
                    </div>

                    <div className="product-price-large">{formatPrice(product.price)}</div>
                    <p className="product-description">{product.description}</p>

                    <div className="ai-protection-badge">
                        <Shield size={20} />
                        <div>
                            <strong>AI-Protected Reviews</strong>
                            <p>All reviews verified by ML</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container review-section">
                <div className="review-grid">
                    <ReviewForm productId={product._id} onReviewSubmitted={fetchProduct} />
                    <ReviewList reviews={product.reviews} />
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
