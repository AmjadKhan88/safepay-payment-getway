import express from "express"
import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import { getToken } from "../configs/jwt.js";


// User signup function
export const userSignUp = async (req,res)=> {
    try {
        const {name,email,password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({message:"All fields are required"})
        }

        // check if user is already exist with this email
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:`User already exists with this email ${email}`})
        }

        // hashing password before saved

        const hashedPassword = await bcrypt.hash(password,10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // generate token 
        const token = await getToken(user._id);
          // ✅ Send token in HTTP-only cookie
        res.cookie("token", token, {
        httpOnly: true,
        secure: false, // true in production (HTTPS)
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
    });

        res.status(201).json({message:"Signup Successfully",user})
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}

// User Login function
export const userLogin = async (req,res)=> {
    try {
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({message:"All fields are required"})
        }

        // check the user is exist or not
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message:"User not found with this email"});
        }

        // campre password
        const camperPassword = await bcrypt.compare(password,user.password);
        if(!camperPassword){
            return res.status(400).json({message:"Password is incorrect"})
        }

        // get jwt token

        const token = await getToken(user._id);
          res.cookie("token", token, {
        httpOnly: true,
        secure: false, // true in production (HTTPS)
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
    });
        res.status(200).json({message:"Login Successfully",user})
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}

// Check User is Authenticated
export const userAuthenticated = async (req,res)=> {
        try {
            const userId = req.userId;
            const user = await User.findById(userId);
            res.status(200).json({user});
        } catch (error) {
            return res.status(500).json({message:error.message})
        }
}

// update user info 
export const userUpdate = async (req,res)=> {
    try {
        const userId = req.user._id;
        const {name} = req.body;
        const file = req.file;
        
        const user = await User.findById(userId);

        if(!user){
            return res.status(400).json({message:"User not found plase login"})
        }

        user.name = name;
        if(file){
            user.image = file.filename;
        }

        await user.save();
        res.status(200).json({user})
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}

export const userLogout = async (req,res)=> {
    try {
        res.clearCookie("token", {
        httpOnly: true,
        secure: false, // true in production (HTTPS)
        sameSite: "none"
        });

    res.json({ message: "Logout successful" });
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}