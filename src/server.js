import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';

const app = express();
const PORT = process.env.PORT;
const BASE_URL = process.env.BASE_URL;
const APP_URL = process.env.APP_URL;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(cors({
    origin: [APP_URL,] // Allow requests from your React app
}));

// Routes
app.use('/api', productRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on ${PORT}`);
    console.log(`📊 API available at ${BASE_URL}/api`);
    console.log(`📊 Client app at ${APP_URL}`);
});