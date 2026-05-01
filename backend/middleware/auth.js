const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'reviewguard-secret-key-change-in-production';

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Middleware: require authentication
const auth = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'Login required' });
        }

        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

// Middleware: optional auth (attach user if token present, but don't block)
const optionalAuth = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (header && header.startsWith('Bearer ')) {
            const token = header.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        }
    } catch (err) {
        // Token invalid — proceed without user
    }
    next();
};

module.exports = { auth, optionalAuth, generateToken, JWT_SECRET };
