# Prod-config

Lättvikts Node/Express-service för att hämta butikskonfiguration från WooCommerce och räkna pris för glasögonkomponenter (glas, toning, båge).

## Snabbstart

1. Installera beroenden:

```sh
npm install
```

# Prod-config

Lättvikts Node/Express-service för att hämta butikskonfiguration från WooCommerce och räkna pris för glasögonkomponenter (glas, toning, båge).

## Snabbstart

1. Installera beroenden:

```sh
npm install
```

2. Kör i utveckling (Windows cmd.exe):

```cmd
npm run dev
```

3. Starta i produktion:

```sh
npm start
```

Rekommenderad Node-version: 18.x eller nyare.

## Exempel på .env (lägg INTE in riktiga nycklar här)

Skapa en `.env` i projektroten med minst följande variabler:

```properties
PORT=3001
BASE_URL=http://localhost:3001
APP_URL=http://localhost:5173
MALMO_URL=http://shop-malmo.local
MARBELLA_URL=http://shop-marbella.local

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx

# Malmö (WooCommerce)
WC_MALMO_KEY=ck_xxx
WC_MALMO_SECRET=cs_xxx

# Marbella (WooCommerce)
WC_MARBELLA_KEY=ck_xxx
WC_MARBELLA_SECRET=cs_xxx
```

Se `.env.example` i repo (om du vill skapa en) för en mall. Lägg `.env` i `.gitignore`.

## Entrypoint

Servern startas från `src/server.js`.

## API — snabba exempel

- GET `/api/stores/:storeId/config`
 	- Exempel: `GET /api/stores/store_malmo/config`
 	- Returnerar butikens currency, defaults (taxPercent, shipping) och arrays `glassTypes`, `tints`, `frames`.

 Svar (förenklat):

```json
{
 "storeId":"store_malmo",
 "currency":"SEK",
 "defaults":{"taxPercent":25,"shipping":49},
 "glassTypes":[{"id":123,"name":"Standard","price":499}],
 "tints":[],
 "frames":[]
}
```

- POST `/api/calculate-price`
 	- Payload-exempel (`application/json`):

```json
{
 "storeId":"store_malmo",
 "selections":{
  "glassType":123,
  "tint":456,
  "frame":789
 }
}
```

 - Svar (förenklat):

```json
{
 "basePrice":900,
 "tax":225,
 "taxPercent":25,
 "shipping":49,
 "total":1174,
 "currency":"SEK"
}
```

Fältet `selections` använder produkt-id (som finns i `glassTypes`, `tints`, `frames`). Modellen normaliserar kategorier och produktfält via `Product.fromWooCommerce`.

## Datamodeller

- `src/models/category.js` — `Category.fromWooCommerce(wcCategory)`
- `src/models/product.js` — `Product.fromWooCommerce(wcProduct)` (normaliserar priser, bilder och categories)

Att använda modeller ger:

- Konsistent shape i hela appen
- Centraliserad parsing/validering (t.ex. säker pris-parse från sträng)
- Lättare testning och återanvändning

## Viktiga filer och vad de gör

- `src/server.js` — startpunkt och Stripe endpoint
- `src/routes/productRoutes.js` — produktrelaterade endpoints
- `src/routes/uploadRoutes.js` — filuppladdningar
- `src/controllers/productController.js` — hanterar requests och anropar tjänster
- `src/services/woocommerceService.js` — hämtar data från WooCommerce (OAuth) och innehåller `calculatePrice`
- `src/controllers/checkoutController.js` — Stripe checkout och betalningslogik
- `src/models/product.js`, `src/models/category.js` — datamodeller
- `src/utils/utils.js` — hjälpfunktioner (t.ex. `stripPTags`)

## Testdata / Bulk-import (CSV)

I mappen `src/data/` finns exempel-CSV-filer som du kan använda för att snabbt lägga upp testprodukter i en WooCommerce-installation. Filerna är tänkta som mallar för bulk-import under test:

- `src/data/optik_malmö.csv`
- `src/data/optik_marbella.csv`
- `src/data/products.json` (sample JSON-data)

Använd CSV-filerna som utgångspunkt och justera kolumnerna efter din WooCommerce-import (vanliga kolumner: `name`, `sku`, `regular_price`, `categories`, `description`). De här filerna gör det enkelt att fylla butiken med testprodukter vid utveckling.

Viktigt: för att tjänsten ska kunna gruppera och hitta produkter för varje komponent måste din WooCommerce-installation ha tre kategorier (skapa dem om de inte finns):

- glassType — rekommenderad slug: `glass`  (glas-typer)
- tint — rekommenderad slug: `tint`     (toningar)
- frame — rekommenderad slug: `frame`   (bågar)

När du importerar CSV:en, se till att kategorikolumnen använder dessa slugs eller namn så att `Product.fromWooCommerce` / filtrering i `woocommerceService` kan matcha produkterna korrekt.

## Uppladdningar

Uppladdade filer sparas i `uploads/` (mappen ignoreras normalt i git). Se `src/routes/uploadRoutes.js` för validering och lagring.

## Felsökning — vanliga problem

- OAuth-signering misslyckas:
 	- Kontrollera att `WC_*_KEY` och `WC_*_SECRET` är korrekta.
 	- Se till att butikens URL är korrekt och att REST API `/wp-json/wc/v3` är tillgängligt.
 	- Klocksynkronisering kan påverka OAuth-signering — kontrollera serverns tid.

- Tomma produktlistor eller saknade fält:
 	- Din WooCommerce-installation kan returnera olika strukturer; `Product.fromWooCommerce` normaliserar detta.
