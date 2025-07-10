import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const messageScheme = new Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String
    },
    image: {
        type: String
    }
},
{timestamps: true}
)

const Message = mongoose.model("Message",messageScheme)
export default Message