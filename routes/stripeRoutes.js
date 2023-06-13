require("dotenv").config();
const express = require("express");
const { mongo } = require("../db/mongo_config");
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_KEY);
const UserModel = require('../models/Twitch/User');
const consoleLoging = require("../helpers/consoleLoging");



const DOMAIN = process.env.LOCAL_MODE ? 'http://localhost:3000' : 'https://berrythebot.app/'



router.post('/stripe-webhook', express.raw({type: 'application/json'}), async (req,  res) => {
  try{
        const sig = req.headers['stripe-signature'];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      res.status(500).send(`Webhook Error: ${err}`);
      return;
    }

    console.log("STRIPE EVENT RECEIVED TYPE: ", event.type) //! REMOVE
  
    const reqestBodyFromBuffer = req.body.toString('utf8')
  
    const session = event.data.object
  
    let customerId = session.customer
  
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const checkoutSessionCompleted = event.data.object;

        const unx_id = session.metadata.unx_id;

        console.log('unx_id: ', unx_id) //! REMOVE

        if(!unx_id) return res.status(200).json({ message: 'Webhook received successfully' });

        await UserModel.setStripeCustomerId(customerId, unx_id);

        res.status(200).json({ message: 'Webhook received successfully' });
        return;
      case 'customer.subscription.created':
          const customerSubscriptionCreated = event.data.object;
          res.status(200).json({ message: 'Webhook received successfully' });
          break;
      case 'invoice.paid':
        res.status(200).json({ message: 'Webhook received successfully' });
        return;
  
      case 'invoice.payment_failed':
        await UserModel.updatePaidStatus(customerId, 'unpaid')
        res.status(200).json({ message: 'Webhook received successfully' });
        return;
      case 'invoice.payment_succeeded':
          await UserModel.updatePaidStatus(customerId, 'paid')
          res.status(200).json({ message: 'Webhook received successfully' });
          break;
      case 'customer.subscription.deleted':
        await UserModel.updatePaidStatus(customerId, 'unpaid')
        res.status(200).json({ message: 'Webhook received successfully' });
        return;
      default:
        console.log(`Unhandled event type ${event.type}`);
        res.status(200).json({ message: 'Webhook received successfully' });
        return; 
    }
  
    return
  } catch (error) {
    console.error(error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
  });


router.post('/create-checkout-session', async (req, res) => {
    const unx_id  = req.query.unx_id
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

router.post('/customer-portal',  async (req, res) => {
  try {
    const  session_id  = req.query.session_id;
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
  
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: checkoutSession.customer,
      return_url: DOMAIN,
    });
  
    res.redirect(303, portalSession.url);
    
  } catch (error) {
    consoleLoging({
      id: 'ERROR',
      user: 'STRIPE',
      script: 'stripeRoutes.js',
      info: 'router.post(/customer-portal)',
    })
    res.status(400).json({ message: error})
    return
  }
})

module.exports = router;