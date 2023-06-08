require("dotenv").config();
const express = require("express");
const { mongo } = require("../db/mongo_config");
const router = express.Router();


router.post('/stripe-webhook', express.raw({type: 'application/json'}), async (request,  response) => {
    const sig = request.headers['stripe-signature'];
  
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(request.body, sig, webhookSecret);
    } catch (err) {
      response.status(500).send(`Webhook Error: ${err}`);
      return;
    }
  
    const reqestBodyFromBuffer = request.body.toString('utf8')
  
    const session = event.data.object
  
    let customerId = session.customer
  
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const unx_id = session.metadata.unx_id;
        if(!unx_id) return response.status(200).json({ message: 'Webhook received successfully' });
        await User.setStripeCustomerId(customerId, unx_id);
        await User.updateStripePaid(customerId)
        response.status(200).json({ message: 'Webhook received successfully' });
        return;
  
      case 'invoice.paid':
        await User.updateStripePaid(customerId)
        response.status(200).json({ message: 'Webhook received successfully' });
        return;
  
      case 'invoice.payment_failed':
        await User.cancelSubscription(customerId)
        response.status(200).json({ message: 'Webhook received successfully' });
        return;
      case 'customer.subscription.deleted':
        await User.cancelSubscription(customerId)
        response.status(200).json({ message: 'Webhook received successfully' });
        return;
      default:
        console.log(`Unhandled event type ${event.type}`);
        response.status(200).json({ message: 'Webhook received successfully' });
        return; 
    }
  
    return
  });


router.post('/stripe-checkout-session', async (req, res) => {
    console.log('CREATE SESSION!!!!: ') //! REMOVE
    const unx_id  = req.query.unx_id
    console.log('CREATE SESSION QUERY: ', req.query) //! REMOVE
    console.log('CREATE SESSION UNX ID: ', unx_id) //! REMOVE
    const prices = await stripe.prices.list({
        lookup_keys: [req.body.lookup_key],
        expand: ['data.product']
    })

    const session = await stripe.checkout.sessions.create({
        billing_address_collection: 'auto',
        line_items: [
          {
            price: prices.data[0].id,
            quantity: 1,
    
          },
        ],
        mode: 'subscription',
        allow_promotion_codes: true,
        success_url: `${DOMAIN}/success/?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${DOMAIN}?canceled=true`,
        automatic_tax: { enabled: true },
        metadata: {unx_id}
      });

    res.redirect(303, session.url);
})

module.exports = router;