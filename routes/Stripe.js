const express = require("express");

const { Orders } = require("../models/Order");
require("dotenv").config();
const stripe = require("stripe")(process.env.Stripe_key);
const router = express.Router();
router.post("/create", async (req, res) => {
  const customer = await stripe.customers.create({
    metadata: {
      userId: req.body.userId,
    },
  });
  const line_items = req.body.cartItems.map((items) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: items.name,
          images: [items.image.url],
          description: items.desp,
          metadata: {
            id: items.id,
          },
        },
        unit_amount: items.price * 100,
      },
      quantity: items.cartTq,
    };
  });
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "ID", "IN"],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 0, currency: "usd" },
          display_name: "Free shipping",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 5 },
            maximum: { unit: "business_day", value: 7 },
          },
        },

        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 50, currency: "usd" },
          display_name: "shipping fee applicable",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 1 },
            maximum: { unit: "business_day", value: 2 },
          },
        },
      },
    ],
    phone_number_collection: {
      enabled: true,
    },
    customer: customer.id,
    line_items,
    mode: "payment",
    success_url: `${process.env.Client_url}/checkout-success`,
    cancel_url: `${process.env.Client_url}/cart`,
  });

  res.send({ url: session.url });
});
const createOrder = async (customer, data, lineItems) => {
  const newOrder = new Orders({
    userId: customer.metadata.userId,
    paymentIntentId: data.payment_intent,
    product: lineItems.data,
    subtotal: data.amount_subtotal,
    shipping: data.customer_details,
    payment_status: data.payment_status,
    customerId: data.customer,
    total: data.amount_total,
  });

  try {
    const saveOrder = await newOrder.save();
  } catch (err) {
    console.log(err);
  }
};

//stripe payment webhook

// This is your Stripe CLI webhook secret for testing your endpoint locally.
// const endpointSecret = "whsec_5862632df7b938d0ab288c56c1fa3a71093201a966c0b45efc6160e4a60ca56c";
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];
    let data;
    let eventType;
    if (1 > 2) {
      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err) {
        console.log(`${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);

        return;
      }
      data = req.body.data.object;
      eventType = req.body.type;
    } else {
      data = req.body.data.object;
      eventType = req.body.type;

      // Handle the event

      switch (req.body.type) {
        case "checkout.session.completed":
          stripe.customers.retrieve(data.customer).then((customer) => {
            stripe.checkout.sessions.listLineItems(
              data.id,
              {},
              function (err, lineItems){
                createOrder(customer, data, lineItems);
              }
            );
          });

          break;
        // ... handle other event types
        default:
          console.log(`Unhandled event type ${eventType}`);
      }

      // Return a 200 res to acknowledge receipt of the event
      res.send().end();
    }
  }
);
module.exports = router;
