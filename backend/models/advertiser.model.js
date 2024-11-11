import mongoose from "mongoose";
import bcrypt from "bcrypt";

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  }
});

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
    businessLicense: fileSchema,
    identificationDocument: fileSchema,
    isVerified: {
        type: Boolean,
        default: false
    },
    activeAds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Advertisement'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

advertiserSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
    next();
});

advertiserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const Advertiser = mongoose.model('Advertiser', advertiserSchema);
export default Advertiser;