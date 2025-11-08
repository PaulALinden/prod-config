import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class CheckoutController {
    async createCheckoutSession(req, res) {
        try {
            const { selections, pricing, config } = req.body;

            // Validera nödvändig indata
            if (!selections || !pricing || !config) {
                return res.status(400).json({
                    error: 'Missing required data: selections, pricing, and config are required'
                });
            }

            // Validera att valda produkter finns
            const selectedGlass = config.glassTypes?.find(g => g.id === selections.glassType);
            const selectedTint = config.tints?.find(t => t.id === selections.tint);
            const selectedFrame = config.frames?.find(f => f.id === selections.frame);

            if (!selectedGlass) {
                return res.status(400).json({ error: 'Selected glass type not found' });
            }

            // Bygg produktbeskrivning
            const description = [
                selectedTint ? `Toning: ${selectedTint.name}` : null,
                selectedFrame ? `Båge: ${selectedFrame.name}` : null
            ].filter(Boolean).join(', ');

            // Verifiera att pricing.total är ett giltigt belopp
            if (!pricing.total || pricing.total <= 0) {
                return res.status(400).json({ error: 'Invalid price' });
            }

            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price_data: {
                            currency: (config.currency || 'sek').toLowerCase(),
                            product_data: {
                                name: `Glasögon - ${selectedGlass.name}`,
                                description: description || undefined,
                            },
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

            // Hantera specifika Stripe-fel
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

    // Lägg till fler checkout-relaterade metoder här vid behov
    // T.ex. webhook-hantering, verifiera betalning, etc.
}

export default new CheckoutController();