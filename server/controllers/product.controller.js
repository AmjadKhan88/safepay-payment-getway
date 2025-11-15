import crypto from "crypto";
import Order from "../models/order.model.js";
import safepayModule from "@sfpy/node-core";

// Safepay Secret Mode (required for payment session + passport)
const safepay = safepayModule(`${process.env.SAFEPAY_SECRET_KEY}`, {
  authType: "secret",
  host: "https://sandbox.api.getsafepay.com"
});


export const paymentOrder = async (req, res) => {
  try {
    const { cart, country, currency = "PKR", address, price } = req.body;
    const userId = req.userId;

    if (!cart || cart.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    if (!country || !address || !price)
      return res
        .status(400)
        .json({ message: "All fields are required (country,address)" });


       // -------------------------------------------
    // 1. CREATE PAYMENT SESSION (NO CUSTOMER)
    // -------------------------------------------
    const session = await safepay.payments.session.setup({
      merchant_api_key: `${process.env.SAFEPAY_API_KEY}`,
      intent: "CYBERSOURCE",
      mode: "payment",
      currency: "PKR",
      amount: price * 100 // convert rupees to paisa
    });


    // Correct tracker extraction
       const trackerToken = session?.data?.tracker?.token;

      if (!trackerToken) {
          return res.status(500).json({ message: "Failed to get tracker token" });
        }

     // -------------------------------------------
    // 2. CREATE AUTH TOKEN
    // -------------------------------------------
    const authResponse = await safepay.auth.passport.create();
    const authToken = authResponse.data;

    if (!authToken) {
          return res.status(500).json({ message: "Failed to get payment auth token" });
        }


      // -------------------------------------------
    // 3. CREATE CHECKOUT URL (NO USER ID)
    // -------------------------------------------
    const checkoutURL = safepay.checkouts.payment.create({
      tracker: trackerToken,
      tbt: authToken,
      environment: "sandbox",
      source: "hosted",
      redirect_url: "http://localhost:5173/order/success",
      cancel_url: "http://localhost:5173/order/cancel"
    });

    // Create DB order
    const newOrder = new Order({
      userId,
      product: cart.map((i) => ({ id: i.id, qty: i.qty })),
      price,
      country,
      address,
      transactionId:trackerToken,
      status: "pending",
    });

    await newOrder.save();

    return res.status(200).json({
      message: "Checkout URL generated",
      checkoutURL,
      tracker: trackerToken
    });
   
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating payment", error: err });
  }
};

// -----------------------------------------------------
// Webhook Verification (VERY IMPORTANT)
// -----------------------------------------------------
export const safepayWebhook = async (req, res) => {
  try {
    const event = req.body;

    // 1. Check required fields
    if (!event?.type || !event?.data) {
      return res.status(400).send("Invalid webhook payload");
    }

    // Only handle successful payment
    if (event.type !== "payment.succeeded") {
      return res.status(200).send("Event ignored");
    }

    const paymentData = event.data;

    const tracker = paymentData?.tracker;
    const success = paymentData?.success;

    if (!tracker || !success) {
      return res.status(400).send("Missing tracker or success flag");
    }

    // 2. Find order matching tracker
    const order = await Order.findOne({ transactionId: tracker });

    if (!order) {
      console.log("Order not found for tracker:", tracker);
      return res.status(404).send("Order not found");
    }

    // 3. Update order as PAID
    order.status = "success";
    await order.save();

    console.log("Payment successful for order:", order._id);

    // 4. Respond OK to Safepay
    return res.status(200).send("Webhook received");

  } catch (error) {
    console.error("Safepay webhook error:", error);
    return res.status(500).send("Server error");
  }
};
