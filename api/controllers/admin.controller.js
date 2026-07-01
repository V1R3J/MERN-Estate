import Listing from '../models/listing.model.js';
import Review from '../models/review.model.js';

export const getPendingListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.status(200).json(listings);
  } catch (err) { next(err); }
};

export const approveListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    res.status(200).json(listing);
  } catch (err) { next(err); }
};

export const rejectListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    res.status(200).json(listing);
  } catch (err) { next(err); }
};

export const deleteListingAdmin = async (req, res, next) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Listing deleted' });
  } catch (err) { next(err); }
};

export const getPendingReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ approved: false }).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) { next(err); }
};

export const approveReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    res.status(200).json(review);
  } catch (err) { next(err); }
};

export const deleteReviewAdmin = async (req, res, next) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Review deleted' });
  } catch (err) { next(err); }
};

export const getApprovedListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.status(200).json(listings);
  } catch (err) { next(err); }
};

export const getApprovedReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ approved: true }).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) { next(err); }
};