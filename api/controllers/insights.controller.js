import Listing from "../models/listing.model.js";
import SiteStats from "../models/siteStats.model.js";

export const getInsights = async (req, res, next) => {
  try {
    const [
      totalListings,
      forSale,
      forRent,
      dealsCompleted,
      ownerContacts,
      newThisWeek,
    ] = await Promise.all([
      Listing.countDocuments(),
      Listing.countDocuments({ type: "sale" }),
      Listing.countDocuments({ type: "rent" }),
      Listing.countDocuments({ status: "sold" }),
      Listing.aggregate([
        { $group: { _id: null, total: { $sum: "$contactClicks" } } },
      ]).then(r => r[0]?.total ?? 0),
      Listing.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    res.status(200).json({
      totalListings,
      forSale,
      forRent,
      dealsCompleted,
      ownerContacts,
      newThisWeek,
    });
  } catch (err) {
    next(err);
  }
};

// Increments the contactClicks counter on a single listing.
// Called the moment a visitor reveals contact details, so ownerContacts stays live.
export const incrementContactClick = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updated = await Listing.findByIdAndUpdate(
      id,
      { $inc: { contactClicks: 1 } },
      { new: true, select: "contactClicks" }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    res.status(200).json({ success: true, contactClicks: updated.contactClicks });
  } catch (err) {
    next(err);
  }
};

// ── Site visitor counter ──────────────────────────────────────────────────
// Increments the global visitor count by 1 and returns the new total.
// Upsert ensures the single "global" stats document is created on first call.
export const registerVisit = async (req, res, next) => {
  try {
    const stats = await SiteStats.findOneAndUpdate(
      { key: "global" },
      { $inc: { visitorCount: 1 } },
      { new: true, upsert: true }
    );

    res.status(200).json({ visitorCount: stats.visitorCount });
  } catch (err) {
    next(err);
  }
};

// Returns the current visitor count without incrementing it.
// Useful if you ever want to display the count somewhere without counting a visit.
export const getVisitorCount = async (req, res, next) => {
  try {
    const stats = await SiteStats.findOne({ key: "global" });
    res.status(200).json({ visitorCount: stats?.visitorCount ?? 0 });
  } catch (err) {
    next(err);
  }
};