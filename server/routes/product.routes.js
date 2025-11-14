import express from 'express'
import { handleWebHooks, paymentOrder } from '../controllers/product.controller.js';
import { auth } from '../middlewares/auth.js';

const prductRoutes = express.Router();

prductRoutes.post('/create',auth,paymentOrder);
prductRoutes.post('/webhooks',auth,handleWebHooks);


export default prductRoutes;