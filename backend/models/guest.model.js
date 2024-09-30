import mongoose from "mongoose"; // Import mongoose

const { Schema } = mongoose; // Destructure Schema from mongoose

const guestSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    mobileNumber: {
        type: String,
        required: true,
    },
    nationality: {
        type: String,
        required: true,
    },
    dob: {
        type: Date,
        required: true,
    },
    jobOrStudent: {
        type: String,
        required: true,
    },
    role: {  // Field to specify user role
        type: String,
        enum: ['guest', 'tour_guide', 'advertiser', 'seller'], // Valid roles
        default: 'guest', // Default role
    },
});

// Static method to check if the user is under 18
guestSchema.statics.isUnder18 = function(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    const age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    return age < 18 || (age === 18 && m < 0);
};

const Guest = mongoose.model('Guest', guestSchema);
export default Guest; // Use export default
