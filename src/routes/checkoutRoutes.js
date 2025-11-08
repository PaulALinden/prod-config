import express from 'express';
import checkoutController from '../controllers/checkoutController.js';

const router = express.Router();

// POST /api/checkout/create-session
router.post('/create-session', checkoutController.createCheckoutSession);

export default router;