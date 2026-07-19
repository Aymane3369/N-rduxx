require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');
const path = require('path');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(cors());
app.use(express.json());
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serveur Stripe actif' });
});


// Servir les fichiers statiques depuis le dossier courant
app.use(express.static(__dirname));

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { items, total, discount, finalTotal } = req.body;
    const amount = Math.round(finalTotal * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      metadata: {
        discount_applied: discount.toString(),
        original_total: total.toString(),
        items_count: items.length.toString(),
      },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === 'payment_intent.succeeded') {
      console.log('✅ Paiement réussi :', event.data.object.id);
    }
    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur Stripe en écoute sur le port ${PORT}`));
