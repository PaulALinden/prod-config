import productService from '../services/woocommerceService.js';

class ProductController {
   

    // GET /api/stores/:storeId/config
    async getStoreConfig(req, res) {
        try {
            const { storeId } = req.params;
            const config = await productService.getStoreConfig(storeId);
            res.json({ success: true, data: config });
        } catch (error) {
            console.log(error)
            const statusCode = error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({ success: false, error: error.message });
        }
    }

    // POST /api/calculate-price
    async calculatePrice(req, res) {
        try {
            const { storeId, selections } = req.body;

            if (!storeId || !selections) {
                return res.status(400).json({
                    success: false,
                    error: 'storeId and selections are required'
                });
            }

            const config = await productService.getStoreConfig(storeId);

            const pricing = productService.calculatePrice(config, selections);

            res.json({ success: true, data: pricing });
        } catch (error) {
            console.error('Error in calculate-price:', error); // DEBUG
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export default new ProductController();