
import mongoose, { Types } from "mongoose"

const productSchema = new mongoose.Schema({
    name: {type:String,required:true},
    category: {type:String,required:true},
    price:{type:Number,required:true},
    offerPrice: {type:Number,required:true},
    rating:{type:Number,default:3},
    image: {type:String},
    userId: {type:mongoose.Types.ObjectId,ref:"User",required:true}
},{timestamps:true});


const Product = mongoose.model("Product",productSchema);

export default Product;