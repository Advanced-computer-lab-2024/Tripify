import mongoose from "mongoose";
import bcrypt from "bcrypt";

const sellerSchema = new mongoose.Schema({
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
    name: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
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

sellerSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

sellerSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const Seller = mongoose.model('Seller', sellerSchema);

export default Seller;
