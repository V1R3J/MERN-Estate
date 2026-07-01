import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: 'https://i.pinimg.com/originals/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg?nii=t',
    },
    isAdmin: { 
        type: Boolean, 
        default: false 
    }
}, 
    {timestamps: true});

const User = mongoose.model('User', userSchema);

export default User;