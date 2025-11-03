import express from "express";
import cors from "cors"
import axios from "axios";
import 'dotenv/config';


const app = express();

app.use(cors({origin:process.env.CLIENT_URL,credentials:true}))
app.use(express.json())

// SafePay configuration
const safepayConfig = {
  baseURL: process.env.SAFEPAY_BASE_URL,
  headers: {
    'Authorization': `Bearer ${process.env.SAFEPAY_API_KEY}`,
    'Content-Type': 'application/json'
  }
};

// Initialize payment
app.post('/api/payments/initiate', async (req, res) => {
  try {
    const { amount, currency = 'USD', order_id } = req.body;

    const paymentData = {
      amount: amount * 100, // Convert to cents
      currency: currency.toUpperCase(),
      order_id: order_id || `order_${Date.now()}`,
      source: 'web',
      redirect_url: `${process.env.CLIENT_URL}/payment-success`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`
    };

    const response = await axios.post(
      `${safepayConfig.baseURL}/order/v1/init`,
      paymentData,
      {
        headers: safepayConfig.headers
      }
    );

    res.json({
      success: true,
      data: response.data.data,
      tracker: response.data.data.tracker
    });
  } catch (error) {
    console.error('Payment initiation error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error.response?.data || error.message
    });
  }
});
app.post('/',(req,res)=>{
  res.send("Api is working")
})
// Verify payment
app.post('/api/payments/verify', async (req, res) => {
  try {
    const { tracker } = req.body;

    const response = await axios.get(
      `${safepayConfig.baseURL}/order/v1/${tracker}`,
      {
        headers: safepayConfig.headers
      }
    );

    const paymentStatus = response.data.data.payment;
    
    res.json({
      success: true,
      data: response.data.data,
      status: paymentStatus.status,
      isPaid: paymentStatus.state === 'authorized' || paymentStatus.state === 'captured'
    });
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.response?.data || error.message
    });
  }
});

// Webhook endpoint (for payment notifications)
app.post('/api/webhooks/safepay', (req, res) => {
  const signature = req.headers['x-safepay-signature'];
  const payload = req.body;

  // Verify webhook signature here (implementation depends on SafePay's webhook signing)
  
  console.log('Webhook received:', payload);
  
  // Process the webhook (update order status, etc.)
  
  res.status(200).json({ received: true ,payload});
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});


export default app;