# Prod-config

Lättvikts Node/Express-service för att hämta butikskonfiguration från WooCommerce och räkna pris för glasögonkomponenter (glas, toning, båge).

## Snabbstart

1. Installera beroenden:

```sh
npm install
```

2. Kör i utveckling:

```sh
npm run dev
```

3. Starta i produktion:

```sh
npm start
```

## Miljövariabler

Skapa en .env i projektroten med minst följande variabler:

PORT
BASE_URL
APP_URL
WIDGET_URL
STRIPE_SECRET_KEY
MALMO_URL
WC_MALMO_KEY
WC_MALMO_SECRET
MARBELLA_URL
WC_MARBELLA_KEY
WC_MARBELLA_SECRET
(.env bör ligga i .gitignore)

## Entrypoint

Servern startas från src/server.js.

## API

```js
GET '/api/stores/:storeId/config'
```

Hämtar butikskonfiguration (kategorier, produkter, valuta, moms, frakt).

```js
POST '/api/calculate-price'
```

Beräknar pris baserat på användarens val (glassType, tint, frame). Returnerar basePrice, tax, shipping, total, currency.

```js
POST '/api/upload/prescription'
```

Tar emot filuppladdning (PDF/JPG/PNG). Sparas i uploads/.

Stripe checkout: endpoint /create-checkout-session i src/server.js.

## Datamodeller

src/models/category.js — Category.fromWooCommerce för att normalisera kategoriobjekt.
src/models/product.js — Product.fromWooCommerce normaliserar priser, bilder och kategorier.

Att ha modeller ger:

Konsistent shape i appen
Enkel parsing/validering (t.ex. pris som number)
Centraliserad mapping från WooCommerce-format

## Viktiga filer

src/server.js — startpunkt
src/routes/productRoutes.js — produktrelaterade endpoints
src/controllers/productController.js — controller-logik
src/services/woocommerceService.js — hämtning från WooCommerce & prislogik
src/models/product.js, src/models/category.js — datamodeller
src/utils/utils.js — hjälpfunktioner (t.ex. stripPTags)
uploads/ — sparar uppladdade filer (ej i repo)

## Hur priset räknas

Prislogiken summerar valda komponenters priser (glas, toning, båge) från butikskonfigurationen, beräknar moms enligt taxPercent och lägger till frakt enligt shipping. Se WooCommerceService.calculatePrice.

## Tips för utveckling

Använd npm run dev (nodemon) för snabb utveckling.
Sätt riktiga WooCommerce-nycklar i miljövariabler för att testa mot butiker.
Mocka API-svar eller använd sample-data under src/data/ vid enhetstester.
Normalisera kategorier i Product-modellen så filter blir stabilt (slug/id).

## Felsökning

Kontrollera att .env-variabler är korrekta och att URL:erna pekar mot WP REST API (/wp-json/wc/v3).
Om OAuth-signering misslyckas: dubbelkolla nyckel/secret och att klockan är rätt på servern.

## Licens

Ingen licens specificerad — lägg till en LICENSE-fil om projektet ska delas.
