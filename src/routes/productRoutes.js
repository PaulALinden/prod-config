import express from 'express';
import productController from '../controllers/productController.js';

// Enkel router för produktrelaterade endpoints
const router = express.Router();

// Hämtar butikskonfiguration (kategorier, produkter, tax, shipping)
router.get('/stores/:storeId/config', productController.getStoreConfig);

// Beräknar pris baserat på val: body { storeId, selections }
router.post('/calculate-price', productController.calculatePrice);

export default router;
