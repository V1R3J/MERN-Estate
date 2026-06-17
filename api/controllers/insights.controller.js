import Listing from "../models/listing.model.js";

export const getInsights = async (req, res, next) => {
  try {
    // run all DB aggregations in parallel — no extra indexes needed
    const [
      totalListings,
      forSale,
      forRent,
      dealsCompleted,
      ownerContacts,
      newThisWeek,
    ] = await Promise.all([

      // total published listings
      Listing.countDocuments(),

      // for-sale listings
      Listing.countDocuments({ type: "sale" }),

      // for-rent listings
      Listing.countDocuments({ type: "rent" }),

      // listings marked as sold/rented
      // adjust the field name to match your schema
      Listing.countDocuments({ status: "sold" }),

      // total contact-owner clicks stored on the listing
      // if you store them as a counter field:
      Listing.aggregate([
        { $group: { _id: null, total: { $sum: "$contactClicks" } } },
      ]).then(r => r[0]?.total ?? 0),

      // listings created in the last 7 days
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