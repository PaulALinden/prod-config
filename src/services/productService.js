import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProductService {   

    constructor() {
        this.dataPath = path.join(__dirname, '../data/products.json');
        this.data = null;
    }

    async loadData() {
        if (!this.data) {
            try {
                const fileContent = await fs.readFile(this.dataPath, 'utf-8');
                this.data = JSON.parse(fileContent);
                console.log('✅ Data loaded successfully');
            } catch (error) {
                console.error('❌ Error loading data:', error);
                throw error;
            }
        }
        return this.data;
    }

    async getAllStores() {
        const data = await this.loadData();
        return Object.keys(data.stores).map(storeId => ({
            id: storeId,
            name: data.stores[storeId].name,
            currency: data.stores[storeId].currency
        }));
    }

    async getStoreConfig(storeId) {
        const data = await this.loadData();
        const store = data.stores[storeId];

        if (!store) {
            throw new Error(`Store with id '${storeId}' not found`);
        }

        // Konvertera priceModifiers till frontend-vänlig struktur
        return {
            storeId,
            name: store.name,
            currency: store.currency,
            priceModifiers: store.priceModifiers,
            defaults: data.defaults,
            // Strukturerad data för frontend (baserat på priceModifiers)
            glassTypes: [
                {
                    id: "glass_single",
                    name: store.currency === "SEK" ? "Enkelslipat glas" : "Single Vision Glass",
                    description: store.currency === "SEK" ? "Standardglas för vanlig syn" : "Standard glass for normal vision",
                    price: store.priceModifiers.glass_single,
                    image: `${process.env.BASE_URL}/images/swopti.svg`,
                },
                {
                    id: "glass_progressive",
                    name: store.currency === "SEK" ? "Progressivt glas" : "Progressive Glass",
                    description: store.currency === "SEK" ? "För både när och fjärr" : "For near and far vision",
                    price: store.priceModifiers.glass_progressive,
                    image: `${process.env.BASE_URL}/images/swopti.svg`,
                }
            ],
            tints: [
                {
                    id: "tint_none",
                    name: store.currency === "SEK" ? "Ingen toning" : "No Tint",
                    description: store.currency === "SEK" ? "Klart glas" : "Clear glass",
                    price: store.priceModifiers.tint_none,
                    image: `${process.env.BASE_URL}/images/swopti.svg`
                },
                {
                    id: "tint_gradient",
                    name: store.currency === "SEK" ? "Gradient toning" : "Gradient Tint",
                    description: store.currency === "SEK" ? "Mjuk övergång" : "Smooth transition",
                    price: store.priceModifiers.tint_gradient,
                    image: `${process.env.BASE_URL}/images/swopti.svg`,
                }
            ],
            frames: [
                {
                    id: "frame_basic",
                    name: store.currency === "SEK" ? "Basic Båge" : "Basic Frame",
                    description: store.currency === "SEK" ? "Enkel och klassisk" : "Simple and classic",
                    price: store.priceModifiers.frame_basic,
                    image: `${process.env.BASE_URL}/images/swopti.svg`,
                },
                {
                    id: "frame_premium",
                    name: store.currency === "SEK" ? "Premium Båge" : "Premium Frame",
                    description: store.currency === "SEK" ? "Exklusiv design" : "Exclusive design",
                    price: store.priceModifiers.frame_premium,
                    image: `${process.env.BASE_URL}/images/swopti.svg`,
                }
            ]
        };
    }

    calculatePrice(selections, storeConfig) {
        let basePrice = 0;

        // Använd priceModifiers från config
        const modifiers = storeConfig.priceModifiers;

        // Lägg till glastyp
        if (selections.glassType && modifiers[selections.glassType] !== undefined) {
            basePrice += modifiers[selections.glassType];
        }

        // Lägg till toning
        if (selections.tint && modifiers[selections.tint] !== undefined) {
            basePrice += modifiers[selections.tint];
        }

        // Lägg till båge
        if (selections.frame && modifiers[selections.frame] !== undefined) {
            basePrice += modifiers[selections.frame];
        }

        // Beräkna moms och frakt
        const taxPercent = storeConfig.defaults?.taxPercent || 0;
        const shipping = storeConfig.defaults?.shipping || 0;
        const tax = basePrice * (taxPercent / 100);
        const total = basePrice + tax + shipping;

        return {
            basePrice,
            tax,
            taxPercent,
            shipping,
            total,
            currency: storeConfig.currency
        };
    }
}

export default new ProductService();