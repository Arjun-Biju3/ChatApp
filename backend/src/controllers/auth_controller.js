import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/user_model.js';
import { generateToken } from '../lib/utils.js';
import cloudinary from '../lib/cloudinary.js';

export const signup = async (req,res)=>{
    const {fullName,email,password} = req.body
    console.log(password);
    
    try {
         if(!fullName || !email || !password){
            return res.status(400).json({message:"All Fields are Required"});  
         }
         if(password.length < 6){
            return res.status(400).json({message:"Password must be atleast 6 characters"});
         }

         const user = await User.findOne({email})
         if(user) return res.status(400).json({message:"Email already exists"});

         const salt = await bcrypt.genSalt(10)
         const hashedPassword = await bcrypt.hash(password,salt)

         const newUser = new User({
            fullName,
            email,
            password:hashedPassword
         })

         if(newUser){
            generateToken(newUser._id,res)
            await newUser.save()
            return res.status(201).json({
                _id:newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
                interactedWith:newUser.interactedWith
            });
         }
         else{
            return res.status(400).json({message:"Invalid user data"});
         }
    } catch (error) {
        console.log("Error in Signup controller",error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const login = async (req,res)=>{
    const {email,password} = req.body
    try {
        if (!email || !password){
            return res.status(400).json({message:"Fields must not be empty"})
        }
        const user = await User.findOne({email}).populate('interactedWith','-password -__v')
        if(!user){
            return res.status(400).json({message:"Invalid Credentials"})
        }
        const is_passsword_correct = await bcrypt.compare(password,user.password)
        if(!is_passsword_correct){
            return res.status(400).json({message:"Invalid Credentials"})
        }
        generateToken(user._id,res)
        res.status(200).json({
             _id:user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
            interactedWith:user.interactedWith
        })
    } catch (error) {
        console.log("Error in Login Controller",error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const logout = async (req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({message:"Logged out successfully"})
    } catch (error) {
        console.log("Error in Logout Controller",error.message);
        res.status(500).json({message:"Internal Server Error"}); 
    }
}

export const updateProfile = async (req,res)=>{
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;
        if(!profilePic){
            res.status(400).json({message:"Profile Picture Required"});
        }
        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true})
        res.status(200).json(updatedUser)
    } catch (error) {
        console.log("Error in updateProfile Controller",error.message);
        res.status(500).json({message:"Internal Server Error"}); 
    }
}

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("interactedWith",'-password -__v');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in checkAuth Controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
