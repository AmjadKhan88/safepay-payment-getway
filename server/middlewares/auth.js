import jwt from 'jsonwebtoken'
import User from '../models/user.model.js';


 export const auth = async (req,res,next)=> {
    try {
        const token = await req.cookies.token;
        // return res.status(400).json({token})
        // const token = await req.headers.token;
        const decode = jwt.verify(token,process.env.SECRET_KEY);

        const user = await User.findById(decode.userId).select("-password");

        if(!user) return res.json({success:false,message:'User not found pleas login'});

        req.userId = user._id;
        next();
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
 }