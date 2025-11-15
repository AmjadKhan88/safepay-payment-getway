import express from 'express'
import { paymentOrder, safepayWebhook } from '../controllers/product.controller.js';
import { auth } from '../middlewares/auth.js';
import bodyParser from 'body-parser';

const prductRoutes = express.Router();

prductRoutes.post('/create',auth,paymentOrder);
prductRoutes.post('/webhooks',auth,bodyParser.raw({ type: "*/*" }),safepayWebhook);


export default prductRoutes;