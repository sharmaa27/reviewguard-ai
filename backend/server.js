require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json());

app.use('/api/products', require('./routes/products'));
app.use('/api/reviews', require('./routes/reviews'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));
app.get('/', (req, res) => res.json({ name: 'ReviewGuard AI API', version: '1.0.0' }));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log('\n═══════════════════════════════════════════');
        console.log('  REVIEWGUARD AI - Backend Server');
        console.log('═══════════════════════════════════════════');
        console.log(`✓ Server: http://localhost:${PORT}`);
        console.log('\nEndpoints:');
        console.log('  GET  /api/products');
        console.log('  POST /api/products/seed');
        console.log('  POST /api/reviews');
        console.log('  GET  /api/reviews/stats');
        console.log('───────────────────────────────────────────\n');
    });
});
