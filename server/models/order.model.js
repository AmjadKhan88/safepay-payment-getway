import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
    userId:{type:mongoose.Types.ObjectId,ref:"User",required:true},
    product: [{id:{type:Number},qty:{type:Number}}],
    price: {type:Number,required:true},
    country: {type:String,required:true},
    address: {type:String,required:true},
    transactionId: {type:String},
    status: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },
},{timestamps:true})

const Order = mongoose.model("Order",orderSchema);

export default Order;