import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
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
        <Router>
            <div className="app">
                <Header stats={stats} />
                <main className="main">
                    <Routes>
                        <Route path="/" element={<HomePage onStatsUpdate={setStats} />} />
                        <Route path="/product/:id" element={<ProductPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
