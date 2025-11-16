import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import Order from "../models/order.model.js";

const safepay = require('@sfpy/node-core')(`${process.env.SAFEPAY_SECRET_KEY}`, {
  authType: 'secret',
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
    console.log('Webhook received - Headers:', req.headers);
      console.log('Webhook received - Raw body:', req.body);

      // 1. Verify signature (important for security)
      const signature = req.headers['x-sfpy-signature'];
      if (!signature) {
        console.log('Missing signature');
        return res.status(401).json({ error: 'Missing signature' });
      }

      // // TODO: Add signature verification when you have webhook secret
      //  const isValid = verifyWebhookSignature(req.body, signature, process.env.SAFEPAY_WEBHOOK_SECRET);
      //  if (!isValid) return res.status(401).json({ error: 'Invalid signature' });

      // 2. Parse the JSON body
      const rawBody = req.body.toString('utf8');
      const event = JSON.parse(rawBody);
      
      console.log('Parsed webhook event:', event);

      // 3. Validate required fields
      if (!event.type || !event.data) {
        console.log('Invalid payload structure');
        return res.status(400).json({ error: 'Invalid payload' });
      }

      // 4. Handle the event
      if (event.type === 'payment.succeeded') {
        await handleSuccessfulPayment(event.data);
      } else if (event.type === 'payment.failed') {
        await handleFailedPayment(event.data);
      } else {
        console.log('Unhandled event type:', event.type);
      }

      // 5. Return SUCCESS response immediately
      console.log('Webhook processed successfully');
      res.status(200).json({ 
        received: true,
        message: 'Webhook processed successfully'
      });

  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(200).send("Error processed");
  }
};

// Handle successful payment
async function handleSuccessfulPayment(paymentData) {
  try {
    console.log('Processing successful payment:', paymentData);
    
    const tracker = paymentData.tracker;
    const amount = paymentData.amount;
    const currency = paymentData.currency;
    const customerEmail = paymentData.customer_email;

    if (!tracker) {
      throw new Error('Missing tracker');
    }

    // Find and update order in database
    const order = await Order.findOne({ transactionId: tracker });
    if (!order) {
      console.error('Order not found for tracker:', tracker);
      throw new Error('Order not found');
    }

    // Update order status
    if (order.status !== 'success') {
      order.status = 'success';
      await order.save();
      console.log('Order updated successfully:', order._id);
    } else {
      console.log('Order already processed:', order._id);
    }

  } catch (error) {
    console.error('Error in handleSuccessfulPayment:', error);
    throw error;
  }
}

// Handle failed payment
async function handleFailedPayment(paymentData) {
  try {
    console.log('Processing failed payment:', paymentData);
    
    const tracker = paymentData.tracker;
    if (!tracker) return;

    // Find and update order
    const order = await Order.findOne({ transactionId: tracker });
    if (!order) {
      console.log('Order not found for failed payment:', tracker);
      return;
    }

    // Update order status to failed
    if (order.status !== 'success') {
      order.status = 'failed';
      await order.save();
      console.log('Order marked as failed:', order._id);
    }

  } catch (error) {
    console.error('Error in handleFailedPayment:', error);
    throw error;
  }
}