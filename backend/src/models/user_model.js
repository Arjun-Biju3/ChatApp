import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    fullName:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true,
        minlength: 6,
    },
    profilePic:{
        type: String,
        default:"",
    },
    interactedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
}]

},{timestamps:true})

const User = mongoose.model("User",userSchema);
export default User