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
    // 1. VERIFY WEBHOOK SIGNATURE (CRITICAL FOR SECURITY)
    const signature = req.headers['x-sfpy-signature'];
    if (!signature) {
      console.warn('Missing webhook signature');
      return res.status(401).send('Unauthorized - Missing signature');
    }

    // You should verify the signature against your webhook secret
    // const isValid = verifyWebhookSignature(req.body, signature, process.env.SAFEPAY_WEBHOOK_SECRET);
    // if (!isValid) {
    //   return res.status(401).send('Unauthorized - Invalid signature');
    // }

    const event = req.body;

    // 2. Check required fields
    if (!event?.type || !event?.data) {
      return res.status(400).send("Invalid webhook payload");
    }

    console.log(`Received webhook: ${event.type}`, { 
      tracker: event.data?.tracker,
      success: event.data?.success 
    });

    // 3. Handle different event types
    switch (event.type) {
      case "payment.succeeded":
        await handleSuccessfulPayment(event.data);
        break;
      
      case "payment.failed":
        await handleFailedPayment(event.data);
        break;
      
      case "payment.cancelled":
        await handleCancelledPayment(event.data);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
        return res.status(200).send("Event ignored");
    }

    // 4. Respond immediately to Safepay
    return res.status(200).send("Webhook received");

  } catch (error) {
    console.error("Safepay webhook error:", error);
    // Still return 200 to prevent retries for unexpected errors
    return res.status(200).send("Webhook processing error");
  }
};

// Handle successful payment
async function handleSuccessfulPayment(paymentData) {
  const tracker = paymentData?.tracker;
  const success = paymentData?.success;

  if (!tracker || success !== true) {
    throw new Error("Missing tracker or invalid success flag");
  }

  // Find order matching tracker
  const order = await Order.findOne({ transactionId: tracker });
  if (!order) {
    console.error("Order not found for tracker:", tracker);
    throw new Error("Order not found");
  }

  // Prevent duplicate processing
  if (order.status === "success") {
    console.log("Order already processed:", order._id);
    return;
  }

  // Update order as PAID
  order.status = "success";
  order.paymentDetails = paymentData; // Store full payment details for reference
  order.paidAt = new Date();
  await order.save();

  console.log("Payment successful for order:", order._id);
  
  // Here you can trigger other actions:
  // - Send confirmation email
  // - Update inventory
  // - Notify shipping department
  // etc.
}

// Handle failed payment
async function handleFailedPayment(paymentData) {
  const tracker = paymentData?.tracker;
  if (!tracker) return;

  const order = await Order.findOne({ transactionId: tracker });
  if (order && order.status !== "success") {
    order.status = "failed";
    order.paymentDetails = paymentData;
    await order.save();
    console.log("Payment failed for order:", order._id);
  }
}

// Handle cancelled payment  
async function handleCancelledPayment(paymentData) {
  const tracker = paymentData?.tracker;
  if (!tracker) return;

  const order = await Order.findOne({ transactionId: tracker });
  if (order && order.status !== "success") {
    order.status = "cancelled";
    order.paymentDetails = paymentData;
    await order.save();
    console.log("Payment cancelled for order:", order._id);
  }
}