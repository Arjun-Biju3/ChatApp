import express from "express";
import dotenv from "dotenv"
import authRoutes from './routes/auth_route.js';
import messageRoutes from './routes/message_route.js'
import { connectDB } from "./lib/db.js";
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'
import { app,server } from "./lib/socket.js";

dotenv.config()


const port = process.env.PORT

const __dirname = path.resolve();

app.use(express.json())
app.use(cookieParser())
app.use(cors(
    {
        origin:"http://localhost:5173",
        credentials: true
    }
))

app.use("/api/auth",authRoutes)
app.use("/api/messages",messageRoutes)

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));
    app.get(/(.*)/,(req,res)=>{
        res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
    })
}

server.listen(port,()=>{
    console.log("server is listening on port",port)
    connectDB();
})