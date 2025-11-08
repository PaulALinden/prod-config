// Hanterar checkout-relaterade routes
import express from 'express';
import checkoutController from '../controllers/checkoutController.js';

const router = express.Router();

// Skapa en ny checkout-session
// POST /api/checkout/create-session
// Body: { selections, pricing, config }
router.post('/create-session', checkoutController.createCheckoutSession);

// TODO: Lägg till webhook endpoint för betalningsbekräftelser
// router.post('/webhook', checkoutController.handleWebhook);

export default router;