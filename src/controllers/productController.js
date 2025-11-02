import productService from '../services/productService.js';

class ProductController {
    // GET /api/stores
    async getAllStores(req, res) {
        try {
            const stores = await productService.getAllStores();
            res.json({ success: true, data: stores });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // GET /api/stores/:storeId/config
    async getStoreConfig(req, res) {
        try {
            const { storeId } = req.params;
            const config = await productService.getStoreConfig(storeId);
            res.json({ success: true, data: config });
        } catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({ success: false, error: error.message });
        }
    }

    // POST /api/calculate-price
    async calculatePrice(req, res) {
        try {
            const { storeId, selections } = req.body;

            console.log('Request body:', req.body); // DEBUG

            if (!storeId || !selections) {
                return res.status(400).json({
                    success: false,
                    error: 'storeId and selections are required'
                });
            }

            const config = await productService.getStoreConfig(storeId);
            console.log('Store config loaded:', config.storeId); // DEBUG
            console.log('Has glassTypes?', config.glassTypes?.length); // DEBUG
            
            const pricing = productService.calculatePrice(selections, config);

            res.json({ success: true, data: pricing });
        } catch (error) {
            console.error('Error in calculate-price:', error); // DEBUG
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export default new ProductController();