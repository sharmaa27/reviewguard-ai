import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Sparkles, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ stats }) => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

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
                
                <div className="header-right">
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

                    {isAuthenticated ? (
                        <div className="user-menu">
                            <span className="user-name">
                                <User size={16} /> {user.name}
                            </span>
                            <button className="logout-btn" onClick={handleLogout}>
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/auth" className="login-btn">
                            <LogIn size={16} /> Login
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
