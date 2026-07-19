const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, total, finalTotal, promoCode, discount } = req.body;

    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'https://n-rduxx.vercel.app';

    // Créer la session Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: items.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            description: `Réf: ${item.productId || ''}`,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.qty || 1,
      })),
      success_url: `${baseUrl}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?cancel=true`,
      metadata: {
        items_count: items.length.toString(),
        total: total.toString(),
        promo_code: promoCode || '',
        discount: String(discount || 0),
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('❌ Erreur Stripe:', error);
    return res.status(500).json({ error: error.message });
  }
};
