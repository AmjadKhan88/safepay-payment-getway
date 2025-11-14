import express from "express";
import cors from "cors"
import 'dotenv/config';
import connectDB from "./configs/db.js";
import userRoutes from "./routes/user.routes.js";
import cookieParser from "cookie-parser"
import prductRoutes from "./routes/product.routes.js";
import bodyParser from "body-parser";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.json())

await connectDB();



// local apis
app.use('/api/users',userRoutes);
app.use('/api/orders',prductRoutes);

app.post('/',(req,res)=>{
  res.send("Api is working")
})




app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});


export default app;