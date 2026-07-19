const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error('❌ Signature manquante ou secret non configuré');
    return res.status(400).send('Webhook Error: Missing signature');
  }

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`📩 Webhook reçu: ${stripeEvent.type}`);

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    console.log(`✅ Paiement réussi !`);
    console.log(`📧 Client: ${session.customer_details?.email || 'Non renseigné'}`);
    console.log(`💰 Total: ${(session.amount_total / 100).toFixed(2)} €`);
    console.log(`🆔 Session ID: ${session.id}`);
    
    // ICI vous pouvez ajouter :
    // - Sauvegarde dans Supabase
    // - Envoi d'email
    // - Mise à jour des stocks
    // - etc.
  }

  return res.status(200).json({ received: true });
};
