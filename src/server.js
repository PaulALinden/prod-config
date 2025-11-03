import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import Stripe from 'stripe';


dotenv.config();

const app = express();
const PORT = process.env.PORT;
const BASE_URL = process.env.BASE_URL;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const YOUR_DOMAIN = 'http://localhost:5173'; // Updated to match Vite’s default port
// Middleware

app.use(express.json());
app.use(express.static('public'));
app.use(cors({
    origin: YOUR_DOMAIN, // Allow requests from your React app
}));

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

app.post('/create-checkout-session', async (req, res) => {
    try {
        const { selections, pricing, config } = req.body;

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: config.currency.toLowerCase(),
                        product_data: {
                            name: `Glasögon - ${config.glassTypes.find(g => g.id === selections.glassType)?.name}`,
                            description: `Toning: ${config.tints.find(t => t.id === selections.tint)?.name}, Båge: ${config.frames.find(f => f.id === selections.frame)?.name}`,
                        },
                        unit_amount: Math.round(pricing.total * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'http://localhost:5173/success',
            cancel_url: 'http://localhost:5173/',
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on ${PORT}`);
    console.log(`📊 API available at ${BASE_URL}/api`);
});