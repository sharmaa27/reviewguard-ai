import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Database, Cpu, TrendingUp, RefreshCw, Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productAPI, reviewAPI } from '../services/api';

const HomePage = ({ onStatsUpdate }) => {
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [productsRes, statsRes] = await Promise.all([
                productAPI.getAll(),
                reviewAPI.getStats()
            ]);
            setProducts(productsRes.data.data || []);
            setStats(statsRes.data.data);
            if (onStatsUpdate) onStatsUpdate(statsRes.data.data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const seedProducts = async () => {
        setSeeding(true);
        try {
            await productAPI.seed();
            await fetchData();
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setSeeding(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="home-page">
            <section className="hero">
                <div className="hero-bg"></div>
                <div className="container hero-content">
                    <div className="hero-badge">
                        <Sparkles size={14} /> Powered by Machine Learning
                    </div>
                    <h1>AI-Based Fake Review Detection</h1>
                    <p>Protecting consumers from fake reviews using advanced NLP and machine learning.</p>
                    
                    {stats && (
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <div className="hero-stat-icon"><Database size={24} /></div>
                                <div className="hero-stat-value">{stats.total}</div>
                                <div className="hero-stat-label">Total Reviews</div>
                            </div>
                            <div className="hero-stat genuine">
                                <div className="hero-stat-icon"><Shield size={24} /></div>
                                <div className="hero-stat-value">{stats.genuine}</div>
                                <div className="hero-stat-label">Genuine</div>
                            </div>
                            <div className="hero-stat blocked">
                                <div className="hero-stat-icon"><Cpu size={24} /></div>
                                <div className="hero-stat-value">{stats.fake}</div>
                                <div className="hero-stat-label">Blocked</div>
                            </div>
                            <div className="hero-stat rate">
                                <div className="hero-stat-icon"><TrendingUp size={24} /></div>
                                <div className="hero-stat-value">{stats.fakeRate}%</div>
                                <div className="hero-stat-label">Detection Rate</div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="products-section container">
                <div className="section-header">
                    <div>
                        <h2>Browse Products</h2>
                        <p>Click on a product to view details and write a review</p>
                    </div>
                    <button className="seed-btn" onClick={seedProducts} disabled={seeding}>
                        {seeding ? (
                            <><Loader2 size={16} className="spin" /> Loading...</>
                        ) : (
                            <><RefreshCw size={16} /> Reset Products</>
                        )}
                    </button>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <Loader2 size={40} className="spin" />
                        <p>Loading...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <Database size={48} />
                        <h3>No Products</h3>
                        <p>Click Reset Products to add sample data</p>
                        <button className="primary-btn" onClick={seedProducts}>
                            <RefreshCw size={16} /> Add Products
                        </button>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            <footer className="footer">
                <div className="container">
                    <p><strong>MCA Major Project</strong> | BIT Mesra, Jaipur Campus</p>
                    <p>Harpreet Singh Arora & Vipul Sharma | Dr. Seema Gaur</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
