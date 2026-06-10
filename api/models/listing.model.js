import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
    {
        // ── Required core fields ──────────────────────────────────────────────
        name:         { type: String,   required: true },
        description:  { type: String,   required: true },
        address:      { type: String,   required: true },
        type:         { type: String,   required: true }, // 'sale' | 'rent'
        regularPrice: { type: Number,   required: true },
        bedrooms:     { type: Number,   required: true },
        bathrooms:    { type: Number,   required: true },
        imageUrls:    { type: [String], required: true },
        userRef:      { type: String,   required: true },

        // ── Pricing ───────────────────────────────────────────────────────────
        offer:         { type: Boolean, default: false },
        discountPrice: { type: Number,  default: 0     },

        // ── Boolean amenities (all optional, default false) ───────────────────
        parking:     { type: Boolean, default: false },
        furnished:   { type: Boolean, default: false },
        swimmingPool:{ type: Boolean, default: false },
        gym:         { type: Boolean, default: false },
        playArea:    { type: Boolean, default: false },
        garden:      { type: Boolean, default: false },
        security:    { type: Boolean, default: false },
        wifi:        { type: Boolean, default: false },
        powerBackup: { type: Boolean, default: false },

        // ── Space details (all optional) ──────────────────────────────────────
        squareFootage: { type: Number, default: null },
        halls:         { type: Number, default: null },
        kitchen:       { type: Number, default: null },

        // ── Suitability (optional) ────────────────────────────────────────────
        // 'any' | 'family' | 'couple' | 'bachelor'
        suitableFor: { type: String, default: 'any' },
    },
    { timestamps: true }
)

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;