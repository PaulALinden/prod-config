import express from 'express';
import productController from '../controllers/productController.js';

const router = express.Router();

// Routes
router.get('/stores/:storeId/config', productController.getStoreConfig);
router.post('/calculate-price', productController.calculatePrice);

export default router;
