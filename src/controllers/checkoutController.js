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

/*

## Viktiga filer och vad de gör

- `src/server.js` — startpunkt och Stripe endpoint
- `src/routes/productRoutes.js` — produktrelaterade endpoints (config, priser)
- `src/routes/checkoutRoutes.js` — checkout och betalning via Stripe
- `src/routes/uploadRoutes.js` — filuppladdningar (recept etc.)
- `src/controllers/productController.js` — hanterar requests och anropar tjänster
- `src/controllers/checkoutController.js` — Stripe checkout och betalningshantering
- `src/services/woocommerceService.js` — hämtar data från WooCommerce (OAuth) och innehåller `calculatePrice`
- `src/models/product.js`, `src/models/category.js` — datamodeller
- `src/utils/utils.js` — hjälpfunktioner (t.ex. `stripPTags`)

## Checkout / Betalning

Betalning hanteras via Stripe med följande flöde:

1. Frontend anropar POST `/api/checkout/create-session` med:
```json
{
  "selections": {
    "glassType": 123,    // Produkt-id från butikskonfig
    "tint": 456,         // Valfritt
    "frame": 789         // Valfritt
  },
  "pricing": {
    "total": 1174        // Totalpris inkl moms
  },
  "config": {            // Butikskonfig från /api/stores/:id/config
    "currency": "SEK",
    "glassTypes": [...],
    "tints": [...],
    "frames": [...]
  }
}
``` */