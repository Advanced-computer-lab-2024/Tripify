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
    
      // Description of the company
      companyDescription: {
        type: String,
       
        trim: true
      },
    
      // URL for the company's website
      website: {
        type: String,
       
        match: [/^(https?:\/\/)?([\w.-]+)+(:\d+)?(\/([\w\/._-]*(\?\S+)?)?)?$/, 'Please enter a valid website URL'] // Basic URL validation
      },
    
      // Hotline for customer service
      hotline: {
        type: String,
       
        trim: true,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid hotline number'] // Ensures valid international phone number format
      },
    
      // Company logo URL
      companyLogo: {
        type: String,
        
      },
    
      // Array of active advertisements linked to the advertiser
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
