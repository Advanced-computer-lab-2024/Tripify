import mongoose from "mongoose";

// Schema for ticket prices based on user type
const ticketPriceSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['foreigner', 'native', 'student'], // Types of ticket users
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
});

// Schema for location using GeoJSON format
const locationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'], // Must be 'Point' for GeoJSON
        required: true,
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
    },
});

// Main schema for historical places
const historicalPlaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Name of the historical place
    },
    description: {
        type: String,
        required: true, // Detailed description
    },
    images: {
        type: [String], // Array of image URLs
        required: true, // Images of the historical place
    },
    location: {
        type: locationSchema,
        required: true, // GeoJSON location
    },
    openingHours: {
        type: String, // Opening hours e.g., "9:00 AM - 5:00 PM"
        required: true,
    },
    ticketPrices: [ticketPriceSchema], // Array of ticket prices for different user types
    isActive: {
        type: Boolean,
        default: true, // Flag to indicate if the place is active
    },
}, { timestamps: true });

historicalPlaceSchema.index({ location: '2dsphere' }); // Index for GeoJSON location

const HistoricalPlace = mongoose.model('HistoricalPlace', historicalPlaceSchema);

export default HistoricalPlace;
