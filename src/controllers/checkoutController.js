// Hanterar Stripe-checkout och betalningsflöden
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class CheckoutController {
    // Skapar en ny Stripe checkout-session för betalning
    // Tar emot:
    // - selections: { glassType, tint, frame } (produkt-ids)
    // - pricing: { total } (totalpris inkl moms)
    // - config: { currency, glassTypes[], tints[], frames[] }
    async createCheckoutSession(req, res) {
        try {
            const { selections, pricing, config } = req.body;

            // Kontrollera att all nödvändig data finns
            if (!selections || !pricing || !config) {
                return res.status(400).json({
                    error: 'Missing required data: selections, pricing, and config are required'
                });
            }

            // Hitta valda produkter från config
            const selectedGlass = config.glassTypes?.find(g => g.id === selections.glassType);
            const selectedTint = config.tints?.find(t => t.id === selections.tint);
            const selectedFrame = config.frames?.find(f => f.id === selections.frame);

            // Måste ha minst glastyp vald
            if (!selectedGlass) {
                return res.status(400).json({ error: 'Selected glass type not found' });
            }

            // Bygg produktbeskrivning (toning och båge är valfritt)
            const description = [
                selectedTint ? `Toning: ${selectedTint.name}` : null,
                selectedFrame ? `Båge: ${selectedFrame.name}` : null
            ].filter(Boolean).join(', ');

            // Verifiera pris (måste vara positivt)
            if (!pricing.total || pricing.total <= 0) {
                return res.status(400).json({ error: 'Invalid price' });
            }

            // Skapa Stripe checkout-session
            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price_data: {
                            currency: (config.currency || 'sek').toLowerCase(),
                            product_data: {
                                name: `Glasögon - ${selectedGlass.name}`,
                                description: description || undefined,
                            },
                            // Stripe vill ha öre/cent, multiplicera med 100
                            unit_amount: Math.round(pricing.total * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${process.env.APP_URL}/success`,
                cancel_url: `${process.env.APP_URL}`,
            });

            res.json({ url: session.url });
        } catch (error) {
            console.error('Stripe checkout error:', error);

            // Ge mer specifika felmeddelanden för Stripe-relaterade problem
            if (error.type === 'StripeInvalidRequestError') {
                return res.status(400).json({
                    error: 'Invalid request to payment provider',
                    details: error.message
                });
            }

            res.status(500).json({
                error: 'Payment session creation failed',
                details: error.message
            });
        }
    }

    // TODO: Lägg till webhook-hantering för att fånga betalningsbekräftelser
    // async handleWebhook(req, res) { ... }
}

export default new CheckoutController();