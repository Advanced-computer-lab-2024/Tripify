import mongoose from "mongoose";
import Activity from "./activity.model.js"; // Import the Activity model
const itinerarySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    activities: [{
        type: mongoose.Schema.Types.ObjectId, // Use ObjectId to reference Activity
        ref: 'Activity' // Reference the Activity model
    }],
    timeline: [{
        activity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Activity'
        },
        startTime: Date,
        endTime: Date
    }],
    language: {
        type: String,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    availableDates: [{
        date: Date,
        availableTimes: [String]
    }],
    accessibility: {
        wheelchairAccessible: { type: Boolean, default: false },
        hearingImpaired: { type: Boolean, default: false },
        visuallyImpaired: { type: Boolean, default: false }
    },
    pickupLocation: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    dropoffLocation: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GuideAdvertiserSeller',
        required: true
    },
    bookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });
itinerarySchema.index({ pickupLocation: '2dsphere', dropoffLocation: '2dsphere' });
itinerarySchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    if (this.bookings && this.bookings.length > 0) {
        next(new Error('Cannot delete itinerary with existing bookings'));
    } else {
        next();
    }
});
// Static method to create a new itinerary
itinerarySchema.statics.createItinerary = async function(itineraryData, tourGuideId) {
    const itinerary = new this({
        ...itineraryData,
        createdBy: tourGuideId // Ensure the correct field is used
    });
    return await itinerary.save();
};
// Instance method to check if the itinerary can be deleted
itinerarySchema.methods.canDelete = function() {
    return this.bookings.length === 0;
};
const Itinerary = mongoose.model('Itinerary', itinerarySchema);
export default Itinerary;