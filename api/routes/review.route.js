import express from "express";
import {
  createReview,
  getApprovedReviews,
  getMyReviews,
  deleteReview,
} from "../controllers/review.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/create", verifyToken, createReview);
router.get("/approved", getApprovedReviews);
router.get("/mine", verifyToken, getMyReviews);
router.delete("/:id", verifyToken, deleteReview);

export default router;