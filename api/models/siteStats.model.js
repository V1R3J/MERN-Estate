import mongoose from "mongoose";

const siteStatsSchema = new mongoose.Schema({
  // Fixed key so there's always exactly one document — easy to upsert against.
  key: {
    type: String,
    default: "global",
    unique: true,
  },
  visitorCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const SiteStats = mongoose.model("SiteStats", siteStatsSchema);

export default SiteStats;