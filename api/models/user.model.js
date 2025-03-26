import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar:{
      type: String,
      default: "https://cdn.vectorstock.com/i/500p/45/19/smiling-male-avatar-with-short-curly-hair-vector-55194519.jpg"
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;