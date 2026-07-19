// Point d'entrée pour Vercel – redirige vers les autres fonctions
module.exports = (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'StyleShop API fonctionne !',
    endpoints: [
      '/api/create-payment-intent',
      '/api/webhook'
    ]
  });
};
