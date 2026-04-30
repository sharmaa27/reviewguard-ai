import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles } from 'lucide-react';

const Header = ({ stats }) => {
    return (
        <header className="header">
            <div className="container header-content">
                <Link to="/" className="logo">
                    <div className="logo-icon">
                        <Shield size={24} />
                    </div>
                    <span className="logo-text">ReviewGuard</span>
                    <span className="logo-badge">
                        <Sparkles size={10} /> AI
                    </span>
                </Link>
                
                {stats && (
                    <div className="nav-stats">
                        <div className="stat-item">
                            <div className="stat-value">{stats.total || 0}</div>
                            <div className="stat-label">Reviews</div>
                        </div>
                        <div className="stat-item genuine">
                            <div className="stat-value">{stats.genuine || 0}</div>
                            <div className="stat-label">Genuine</div>
                        </div>
                        <div className="stat-item fake">
                            <div className="stat-value">{stats.fake || 0}</div>
                            <div className="stat-label">Blocked</div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
