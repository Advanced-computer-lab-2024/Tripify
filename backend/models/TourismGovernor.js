import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Tourism Governor Schema
const TourismGovernorSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    // Add more fields if needed
});

// Hash password before saving
TourismGovernorSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const TourismGovernor =mongoose.model('TourismGovernor',TourismGovernorSchema);
export default TourismGovernor; 