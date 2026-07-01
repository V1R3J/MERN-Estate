import dotenv from 'dotenv'
dotenv.config()

import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';
import { Client, Storage } from 'node-appwrite';
import 'dotenv/config'  

// ── Appwrite server client ─────────────────────────────────────────────────────
const client = new Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const storage = new Storage(client)
const BUCKET_ID = process.env.VITE_APPWRITE_BUCKET_ID

// ── helper: extract file ID from full Appwrite view URL ───────────────────────
// URL shape: .../storage/buckets/{bucketId}/files/{fileId}/view?project=...
const extractFileId = (url) => {
  try {
    return url.split('/files/')[1].split('/')[0]
  } catch {
    return null
  }
}

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }

  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, 'You can only delete your own listings!'));
  }

  try {
    // Delete all images from Appwrite bucket first
    const deleteImagePromises = (listing.imageUrls || [])
      .map(url => extractFileId(url))
      .filter(Boolean)
      .map(fileId =>
        storage.deleteFile(BUCKET_ID, fileId).catch(err => {
          // Log but don't block — if a file is already gone, still delete the listing
          console.warn(`Could not delete Appwrite file ${fileId}:`, err.message)
        })
      )

    await Promise.all(deleteImagePromises)

    // Then delete the listing document from MongoDB
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json('Listing has been deleted!');
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }
  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, 'You can only update your own listings!'));
  }

  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    let offer = req.query.offer;
    if (offer === undefined || offer === 'false') {
      offer = { $in: [false, true] };
    }

    let furnished = req.query.furnished;
    if (furnished === undefined || furnished === 'false') {
      furnished = { $in: [false, true] };
    }

    let parking = req.query.parking;
    if (parking === undefined || parking === 'false') {
      parking = { $in: [false, true] };
    }

    let type = req.query.type;
    if (type === undefined || type === 'all') {
      type = { $in: ['sale', 'rent'] };
    }

    
    let swimmingPool = req.query.swimmingPool;
    if (swimmingPool === undefined || swimmingPool === 'false') {
      swimmingPool = { $in: [false, true] };
    }

    let gym = req.query.gym;
    if (gym === undefined || gym === 'false') {
      gym = { $in: [false, true] };
    }

    let playArea = req.query.playArea;
    if (playArea === undefined || playArea === 'false') {
      playArea = { $in: [false, true] };
    }

    let garden = req.query.garden;
    if (garden === undefined || garden === 'false') {
      garden = { $in: [false, true] };
    }

    let security = req.query.security;
    if (security === undefined || security === 'false') {
      security = { $in: [false, true] };
    }

    let wifi = req.query.wifi;
    if (wifi === undefined || wifi === 'false') {
      wifi = { $in: [false, true] };
    }

    let powerBackup = req.query.powerBackup;
    if (powerBackup === undefined || powerBackup === 'false') {
      powerBackup = { $in: [false, true] };
    }

   
    let suitableForFilter = {};
    const suitableFor = req.query.suitableFor;
    if (suitableFor && suitableFor !== 'all') {
      suitableForFilter = { suitableFor };
    }

    // ── price range filter ─────────────────────────────────────────────────
    const minPrice = parseInt(req.query.minPrice);
    const maxPrice = parseInt(req.query.maxPrice);
    let priceFilter = {};
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      priceFilter.regularPrice = {};
      if (!isNaN(minPrice)) priceFilter.regularPrice.$gte = minPrice;
      if (!isNaN(maxPrice)) priceFilter.regularPrice.$lte = maxPrice;
    }

    
    let bedroomsFilter = {};
    if (req.query.bedrooms) {
      bedroomsFilter = { bedrooms: { $gte: parseInt(req.query.bedrooms) } };
    }

    // ── location filter (new) ────────────────────────────────────────────────
    // Exact match — values come from the fixed state/city dataset on the
    // frontend (indianLocations.js), so no regex/partial matching is needed.
    let locationFilter = {};
    if (req.query.state) locationFilter.state = req.query.state;
    if (req.query.city)  locationFilter.city  = req.query.city;

    const searchTerm = req.query.searchTerm || '';
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order || 'desc';

    const listings = await Listing.find({
      name: { $regex: searchTerm, $options: 'i' },
      offer,
      furnished,
      parking,
      type,
      swimmingPool,
      gym,
      playArea,
      garden,
      security,
      wifi,
      powerBackup,
      ...suitableForFilter,
      ...priceFilter,
      ...bedroomsFilter,
      ...locationFilter,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};