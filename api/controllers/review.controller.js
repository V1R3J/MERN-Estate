import Review from "../models/review.model.js";

const ANONYMOUS_AVATAR =
  "https://i.pinimg.com/originals/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg?nii=t";
const ANONYMOUS_NAME = "Anonymous User";

// Strips out the real identity for anonymous reviews before sending to the
// client. The DB always keeps the true userId — only the response is masked.
function formatReview(review) {
  const base = {
    _id: review._id,
    rating: review.rating,
    quote: review.quote,
    role: review.isAnonymous ? "" : review.role,
    createdAt: review.createdAt,
  };

  if (review.isAnonymous) {
    return { ...base, name: ANONYMOUS_NAME, avatar: ANONYMOUS_AVATAR };
  }

  return {
    ...base,
    name: review.userId?.username ?? "Nestora User",
    avatar: review.userId?.avatar ?? ANONYMOUS_AVATAR,
  };
}

// POST /api/review/create
// Logged-in users only (verifyToken middleware sets req.user.id).
export const createReview = async (req, res, next) => {
  try {
    const { rating, quote, role, isAnonymous } = req.body;

    if (!rating || !quote?.trim()) {
      return res.status(400).json({ success: false, message: "Rating and review text are required." });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    }

    const review = await Review.create({
      userId: req.user.id,
      rating,
      quote: quote.trim(),
      role: role?.trim() || "",
      isAnonymous: Boolean(isAnonymous),
    });

    res.status(201).json({ success: true, review: formatReview(review) });
  } catch (err) {
    next(err);
  }
};

// GET /api/review/approved?limit=6
// Public — used on Home.jsx. Only ever returns approved reviews.
export const getApprovedReviews = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 6, 20);

    const reviews = await Review.find({ approved: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("userId", "username avatar");

    res.status(200).json(reviews.map(formatReview));
  } catch (err) {
    next(err);
  }
};

// GET /api/review/mine
// Logged-in user's own review history, including ones still pending approval.
export const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("userId", "username avatar");

    res.status(200).json(reviews.map(formatReview));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/review/:id
// User can delete their own review.
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only delete your own review." });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Review deleted." });
  } catch (err) {
    next(err);
  }
};