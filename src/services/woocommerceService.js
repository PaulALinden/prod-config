// backend/src/services/wooCommerceService.js
import axios from 'axios';
import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import { Category } from '../models/category.js';
import { Product } from '../models/product.js';
import { stripPTags } from '../utils/utils.js';


const STORES = {
    store_malmo: {
        url: process.env.MALMO_URL,
        key: process.env.WC_MALMO_KEY,
        secret: process.env.WC_MALMO_SECRET,
        currency: 'SEK',
        taxPercent: 25,
        shipping: 49
    },
    store_marbella: {
        url: process.env.MARBELLA_URL,
        key: process.env.WC_MARBELLA_KEY,
        secret: process.env.WC_MARBELLA_SECRET,
        currency: 'EUR',
        taxPercent: 25,
        shipping: 49
    }
};

class WooCommerceService {
    createOAuth(store) {
        return OAuth({
            consumer: {
                key: store.key,
                secret: store.secret
            },
            signature_method: 'HMAC-SHA1',
            hash_function(baseString, key) {
                return crypto
                    .createHmac('sha1', key)
                    .update(baseString)
                    .digest('base64');
            }
        });
    }

    async getStoreConfig(storeId) {
        const store = STORES[storeId];
        if (!store) throw new Error(`Store ${storeId} not found`);

        const oauth = this.createOAuth(store);
        const baseUrl = `${store.url}/wp-json/wc/v3`;

        // Bygg signerade URLs
        const categoriesUrl = oauth.authorize(
            { url: `${baseUrl}/products/categories`, method: 'GET' }
        );
        const productsUrl = oauth.authorize(
            { url: `${baseUrl}/products?per_page=100`, method: 'GET' }
        );

        // Skapa signerade querystrings
        const signedCategoriesUrl = `${baseUrl}/products/categories?${new URLSearchParams(categoriesUrl).toString()}`;
        const signedProductsUrl = `${baseUrl}/products?per_page=100&${new URLSearchParams(productsUrl).toString()}`;

        // Hämta data parallellt
        const [categoriesRes, productsRes] = await Promise.all([
            axios.get(signedCategoriesUrl),
            axios.get(signedProductsUrl)
        ]);

        const categories = categoriesRes.data
            .filter(cat => cat.slug !== 'uncategorized')
            .map(cat => Category.fromWooCommerce(cat));

        const products = productsRes.data.map(prod => Product.fromWooCommerce(prod));

        // Gruppera produkter per kategori
        function mapProductsByCategory(products, category) {
            return products
                .filter(p => p.categories.includes(category))
                .map(p => ({
                    ...p,
                    description: stripPTags(p.description || ''),
                    short_description: stripPTags(p.short_description || '')
                }));
        }

        // I getStoreConfig:
        const glassTypes = mapProductsByCategory(products, 'glass');
        const tints = mapProductsByCategory(products, 'tint');
        const frames = mapProductsByCategory(products, 'frame');

        return {
            storeId,
            currency: store.currency,
            defaults: {
                taxPercent: store.taxPercent,
                shipping: store.shipping
            },
            glassTypes,
            tints,
            frames
        };
    }

    calculatePrice(storeConfig, selections) {
        let basePrice = 0;

        if (selections.glassType) {
            const glass = storeConfig.glassTypes.find(g => g.id === selections.glassType);
            if (glass) basePrice += glass.price;
        }

        if (selections.tint) {
            const tint = storeConfig.tints.find(t => t.id === selections.tint);
            if (tint) basePrice += tint.price;
        }

        if (selections.frame) {
            const frame = storeConfig.frames.find(f => f.id === selections.frame);
            if (frame) basePrice += frame.price;
        }
        console.log(storeConfig)
        const tax = basePrice * (storeConfig.defaults.taxPercent / 100);
        const total = basePrice + tax + storeConfig.defaults.shipping;

        return {
            basePrice,
            tax,
            taxPercent: storeConfig.defaults.taxPercent,
            shipping: storeConfig.defaults.shipping,
            total,
            currency: storeConfig.currency
        };
    }
}

export default new WooCommerceService();
