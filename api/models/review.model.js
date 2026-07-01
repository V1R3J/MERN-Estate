import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  // Always stored — even anonymous reviews keep a real user reference
  // internally, for moderation and spam prevention. Only the *display*
  // is anonymized, not the backend record.
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  quote: {
    type: String,
    required: true,
    maxlength: 500,
  },
  role: {
    type: String,
    maxlength: 100,
    default: "",
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  approved: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;