import mongoose from "mongoose";
import bcrypt from "bcrypt";

const advertiserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        trim: true
    },
    companyDescription: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        match: [/^(https?:\/\/)?([\w.-]+)+(:\d+)?(\/([\w\/._-]*(\?\S+)?)?)?$/, 'Please enter a valid website URL']
    },
    hotline: {
        type: String,
        trim: true,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid hotline number']
    },
    companyLogo: {
        type: String
    },
    activeAds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Advertisement'
    }],
    termsAccepted: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isDeletionRequested: {
        type: Boolean,
        default: false,
    },
    
}, { timestamps: true });

advertiserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

advertiserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const Advertiser = mongoose.model('Advertiser', advertiserSchema);

export default Advertiser;
