import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected :", () =>
      console.log("database connected")
    );

    await mongoose.connect(
      `${process.env.MONGOOSE_URI}/safepay-payment-getway`
    ).then(()=>{
      console.log("Database connected successfully")
    })
    
  } catch (error) {
    console.log("Mongose Error : " + error);
  }
};

export default connectDB;
