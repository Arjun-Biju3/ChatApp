import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.js";
import User from "../models/user_model.js";
import {getRecieverSocketId, io} from'../lib/socket.js'

export const getUsersForSidebar = async(req,res)=>{
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne:loggedInUserId}}).select("-password")
        res.status(200).json(filteredUsers)
    } catch (error) {
        console.error("Error in getUsersForSidebar:",error.message);
        res.status(500).json({error:"Internal server error"});
    }
}

export const getMessages = async(req,res)=>{
    try {
        const {id:userToChatId} = req.params
        const myId = req.user._id;
        const messages = await Message.find({
            $or:[
                {senderId:myId,receiverId:userToChatId},
                {senderId:userToChatId,receiverId:myId}
            ]
        })
        res.status(200).json(messages)
    } catch (error) {
        console.log("Error in getMessages:",error.message);
        res.status(500).json({error:"Internal server error"});
    }
}

export const sendMessage = async(req,res)=>{
    try {
        const {text,image} = req.body;
        const {id:receiverId} = req.params;
        const senderId = req.user._id;
        let imageUrl;
        if (image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl
        });

        await newMessage.save()

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender.interactedWith.includes(receiverId)) {
            sender.interactedWith.push(receiverId);
            await sender.save(); 
        }

        if (!receiver.interactedWith.includes(senderId)) {
            receiver.interactedWith.push(senderId);
            await receiver.save(); 
        }

        //socket.io
        const recieverSocketId = getRecieverSocketId(receiverId);
        if(recieverSocketId){
            io.to(recieverSocketId).emit("newMessage",newMessage)
            io.to(recieverSocketId).emit("newInteraction", {
                _id: sender._id,
                fullName: sender.fullName,
                email: sender.email,
                profilePic: sender.profilePic
            });
        }
        res.status(201).json(newMessage)
    } catch (error) {
        console.log("Error in sendMessage:",error.message);
        res.status(500).json({error:"Internal server error"});
    }
}