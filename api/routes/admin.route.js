import express from 'express';
import { verifyAdmin } from '../utils/verifyAdmin.js';
import {
  getPendingListings, approveListing, rejectListing, deleteListingAdmin,
  getPendingReviews, approveReview, deleteReviewAdmin, getApprovedListings, getApprovedReviews
} from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/listings/pending', verifyAdmin, getPendingListings);
router.patch('/listings/:id/approve', verifyAdmin, approveListing);
router.patch('/listings/:id/reject', verifyAdmin, rejectListing);
router.delete('/listings/:id', verifyAdmin, deleteListingAdmin);
router.get('/listings/approved', verifyAdmin, getApprovedListings);
router.get('/reviews/approved', verifyAdmin, getApprovedReviews);
router.get('/reviews/pending', verifyAdmin, getPendingReviews);
router.patch('/reviews/:id/approve', verifyAdmin, approveReview);
router.delete('/reviews/:id', verifyAdmin, deleteReviewAdmin);

export default router;