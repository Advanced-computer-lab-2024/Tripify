import mongoose from 'mongoose';
const { Schema } = mongoose;

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
        required: function() {
            return this.role === 'guest'; // Only required for guests
        }
    },
    nationality: {
        type: String,
        required: function() {
            return this.role === 'guest'; // Only required for guests
        }
    },
    dob: {
        type: Date,
        required: function() {
            return this.role === 'guest'; // Only required for guests
        }
    },
    jobOrStudent: {
        type: String,
        required: function() {
            return this.role === 'guest'; // Only required for guests
        }
    },
    role: {
        type: String,
        enum: ['guest', 'tour_guide', 'advertiser', 'seller'],
        default: 'guest' // Default to guest if role isn't provided
    }
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
export default Guest;
