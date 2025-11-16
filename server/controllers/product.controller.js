import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import Order from "../models/order.model.js";

const safepay = require('@sfpy/node-core')(`${process.env.SAFEPAY_SECRET_KEY}`, {
  authType: 'secret',
  webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET,
  host: 'https://sandbox.api.getsafepay.com'
});

export const paymentOrder = async (req, res) => {
  try {
    const { cart, country, currency = "PKR", address, price } = req.body;
    const userId = req.userId;

    if (!cart || cart.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    if (!country || !address || !price)
      return res.status(400).json({ message: "All fields are required" });

    // -------------------------------------------
    // 1. CREATE PAYMENT SESSION
    // -------------------------------------------
    const session = await safepay.payments.session.setup({
      merchant_api_key: `${process.env.SAFEPAY_API_KEY}`,
      intent: "CYBERSOURCE",
      mode: "payment",
      currency: "PKR",
      amount: price * 100 // convert rupees to paisa
    });

    const trackerToken = session?.data?.tracker?.token;

    if (!trackerToken) {
      return res.status(500).json({ message: "Failed to get tracker token" });
    }

    // -------------------------------------------
    // 2. CREATE AUTHENTICATION TOKEN (CORRECT METHOD)
    // -------------------------------------------
    let authToken;
    try {
      // Use the correct method based on the SDK structure
      const authResponse = await safepay.client.passport.create();
      authToken = authResponse?.data;
      
      if (!authToken) {
        return res.status(500).json({ message: "Failed to get payment auth token" });
      }
    } catch (authError) {
      console.error("Auth token creation failed:", authError);
      return res.status(500).json({ 
        message: "Failed to create payment auth token", 
        error: authError.message 
      });
    }

    // -------------------------------------------
    // 3. CREATE CHECKOUT URL (CORRECT METHOD)
    // -------------------------------------------
    const checkoutURL = safepay.checkout.createCheckoutUrl({
      env: "sandbox", // Use 'env' instead of 'environment'
      tracker: trackerToken,
      tbt: authToken,
      source: "hosted",
      redirect_url: `${process.env.CLIENT_URL}/order/success`,
      cancel_url: `${process.env.CLIENT_URL}http://localhost:5173/order/cancel`
    });

    // Create DB order
    const newOrder = new Order({
      userId,
      product: cart.map((i) => ({ id: i.id, qty: i.qty })),
      price,
      country,
      address,
      transactionId: trackerToken,
      status: "pending",
    });

    await newOrder.save();

    return res.status(200).json({
      message: "Checkout URL generated",
      checkoutURL,
      tracker: trackerToken
    });
   
  } catch (err) {
    console.error("Payment order error:", err);
    res.status(500).json({ message: "Error creating payment", error: err.message });
  }
};

// -----------------------------------------------------
// Webhook Verification
// -----------------------------------------------------
// -----------------------------------------------------
// Webhook Verification (SECURE VERSION)
// -----------------------------------------------------
export const safepayWebhook = async (req, res) => {
  try {
    // 1. Check signature (UNCOMMENT THIS)
    const signature = req.headers['x-sfpy-signature'];
    if (!signature) {
      return res.status(401).send('Missing signature');
    }

    // TODO: Add signature verification here
    // const isValid = verifySignature(req.body, signature, process.env.SAFEPAY_SECRET);
    // if (!isValid) return res.status(401).send('Invalid signature');

    const event = req.body;    

    // 2. Basic check
    if (!event?.type || !event?.data) {
      return res.status(400).send("Invalid data");
    }

    console.log(`Webhook: ${event.type}`, event.data?.tracker);

    // 3. Handle events
    if (event.type === "payment.succeeded") {
      await handleSuccessfulPayment(event.data);
    } else if (event.type === "payment.failed") {
      await handleFailedPayment(event.data);
    } else {
      return res.status(200).send("Event ignored");
    }

    return res.status(200).send("Webhook received");

  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(200).send("Error processed");
  }
};

// Handle successful payment
async function handleSuccessfulPayment(paymentData) {
  const tracker = paymentData?.tracker;
  
  if (!tracker) {
    throw new Error("No tracker found");
  }

  // Find order
  const order = await Order.findOne({ transactionId: tracker });
  if (!order) {
    throw new Error("Order not found");
  }

  // Check if already processed
  if (order.status === "success") {
    console.log("Order already paid");
    return;
  }

  // Update order
  order.status = "success";
  await order.save();

  console.log("Payment success for order:", order._id);
}

// Handle failed payment
async function handleFailedPayment(paymentData) {
  const tracker = paymentData?.tracker;
  
  if (!tracker) return;

  // Find order
  const order = await Order.findOne({ transactionId: tracker });
  if (!order) return;

  // Don't update if already successful
  if (order.status === "success") {
    console.log("Order already paid, ignoring failure");
    return;
  }

  // Mark as failed (DON'T DELETE)
  order.status = "failed";
  await order.save();

  console.log("Payment failed for order:", order._id);
}