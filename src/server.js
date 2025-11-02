import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const BASE_URL = process.env.BASE_URL;

// Middleware
app.use(cors());//Lägga till begränsingar
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api', productRoutes);

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
    console.log(`🚀 Server running on ${BASE_URL}`);
    console.log(`📊 API available at ${BASE_URL}/api`);
});