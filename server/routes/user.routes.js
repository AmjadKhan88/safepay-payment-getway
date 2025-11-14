import express from 'express'
import { userAuthenticated, userLogin, userLogout, userSignUp, userUpdate } from '../controllers/user.controller.js';
import { auth } from '../middlewares/auth.js';

const userRoutes = express.Router();

userRoutes.post('/signup',userSignUp);
userRoutes.post('/login',userLogin);
userRoutes.put('/update',auth,userUpdate);
userRoutes.get('/get',auth,userAuthenticated);
userRoutes.post('/logout',auth,userLogout);


export default userRoutes;