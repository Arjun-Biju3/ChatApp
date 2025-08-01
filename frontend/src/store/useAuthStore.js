import {create} from 'zustand'
import { axiosInstance } from '../lib/axios'
import toast from 'react-hot-toast';
import { io } from 'socket.io-client'


const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/"

export const useAuthStore = create((set,get)=>({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth:true,
    onlineUsers: [],
    interactedUsers:[],
    socket:null,

    checkAuth: async()=>{
        try {
            const response = await axiosInstance.get("/auth/check");
            console.log("testttt",response.data);
            set({authUser:response.data})
            set({interactedUsers:response.data.interactedWith})
            get().connectSocket()
            console.log(response);
        } catch (error) {
            console.log("Error in checkAuth",error);
            set({authUser:null})
        }
        finally{
            set({isCheckingAuth:false});
        }
    },
    signup: async (data)=>{
        set({isSigningUp:true})
        try {
            const response = await axiosInstance.post("/auth/signup",data);
            set({authUser:response.data})
            set({interactedUsers:response.data.interactedWith})
            toast.success("Account created successfully")
            get().connectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
        }
        finally{
            set({isSigningUp:false})
        }
    },
    login: async(data)=>{
        set({ isLoggingIn: true });
        try {
        const res = await axiosInstance.post("/auth/login", data);
        set({ authUser: res.data });
        set({interactedUsers:response.data.interactedWith})
        toast.success("Logged in successfully");
        get().connectSocket()
        } catch (error) {
        toast.error(error.response.data.message);
        console.log(error);
        } finally {
        set({ isLoggingIn: false });
        }
    },

    logout: async ()=>{
        try {
            await axiosInstance.post("/auth/logout");
            set({authUser:null});
            toast.success("Logged out successfully")
            get().disconnectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },
    updateProfile: async(data)=>{
        set({isUpdatingProfile: true});
        try {
            const response = await axiosInstance.put("/auth/update-profile",data);
            set({authUser: response.data});
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("Error in update profile:",error);
            toast.error(error.response.data.message);
        }
        finally{
            set({isUpdatingProfile: false});
        }
    },
    connectSocket: ()=>{
        const {authUser} = get()
        if(!authUser || get().socket?.connected) return;
        const socket = io(BASE_URL,{
            query:{
                userId:authUser._id
            }
        });
        socket.connect()
        set({socket:socket})
        socket.on("getOnlineUsers", (userIds)=>{
            set({onlineUsers:userIds})
        });
        socket.on("newInteraction", (newUser) => {
        const current = get().interactedUsers;
        const exists = current.some(u => u._id === newUser._id);
        if (!exists) {
            set({ interactedUsers: [newUser,...current] });
        }
    });
    },
    disconnectSocket:()=>{
        if(get().socket?.connected) get().socket.disconnect()
    },
    setInteractedUsers: (user) => {
    const currentUsers = get().interactedUsers;
    const alreadyExists = currentUsers.some(u => u._id === user._id);
    if (!alreadyExists) {
        set({ interactedUsers: [user,...currentUsers] });
    }
}
}));