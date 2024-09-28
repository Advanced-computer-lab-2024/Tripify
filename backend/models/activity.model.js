import mongoose from "mongoose";

//TODO implement user authentication middleware 

const activitySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'], // 'Point' for GeoJSON
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true, // [longitude, latitude]
        },
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
    },
    discounts: {
        type: String, 
    },
    budget: {
        type: Number
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
      },
    bookingOpen: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true }); 

activitySchema.index({ location: '2dsphere' });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
