import crypto from "crypto"
import axios from "axios"
import Order from "../models/order.model.js";

const { SAFEPAY_SECRET_KEY, SAFEPAY_API_KEY, SAFEPAY_BASE_URL } = process.env;

// function for payment intent
export const paymentOrder = async (req,res)=> {
    try {
    const { cart, country, address, price } = await req.body;
    const userId = req.userId;

    if(!cart || cart.length === 0){
        return res.status(400).json({message:"Cart is empty"})
    }

    if(!country || !address || !price){
        return res.status(400).json({message:"All fields are required (country,address)"})
    }

    // generate unique transaction id
    const transactionId = crypto.randomBytes(8).toString("hex");

     // create order
    const newOrder = new Order({
      userId,
      product: cart.map(item => ({
        id: item.id,
        qty: item.qty,
      })),
      price,
      country,
      address,
      transactionId,
      status: "pending",
      orderStatus: "processing",
    });

    await newOrder.save();


    // make a request for payment link
    const response = await axios.post(
      `${SAFEPAY_BASE_URL}/order/v1/init`,
      {
        amount:price,
        currency:"PKR",
        intent: "CYBERSOURCE",
        mode: "payment",
        order_id: transactionId,
        client: SAFEPAY_API_KEY,
        environment: "sandbox"
      },
      {
        headers: {
          Authorization: `Bearer ${SAFEPAY_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({data:response.data});
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: "Error creating payment",error:error.message });
  }
}

// handle webhooks from safepay
export const handleWebHooks = async (req,res)=> {
  
}