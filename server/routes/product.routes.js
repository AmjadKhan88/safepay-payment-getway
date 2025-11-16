import express from 'express'
import { paymentOrder, safepayWebhook } from '../controllers/product.controller.js';
import { auth } from '../middlewares/auth.js';
import bodyParser from 'body-parser';

const prductRoutes = express.Router();

prductRoutes.post('/create',auth,paymentOrder);
prductRoutes.post('/webhooks', 
  bodyParser.raw({ type: 'application/json' }),
  safepayWebhook
);


export default prductRoutes;