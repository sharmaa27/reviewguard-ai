import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import AuthPage from './pages/AuthPage';
import { reviewAPI } from './services/api';
import './App.css';

function App() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        reviewAPI.getStats()
            .then(res => setStats(res.data.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <AuthProvider>
            <Router>
                <div className="app">
                    <Header stats={stats} />
                    <main className="main">
                        <Routes>
                            <Route path="/" element={<HomePage onStatsUpdate={setStats} />} />
                            <Route path="/product/:id" element={<ProductPage />} />
                            <Route path="/auth" element={<AuthPage />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
