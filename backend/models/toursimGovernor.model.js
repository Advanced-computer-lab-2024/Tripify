<<<<<<< HEAD
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const tourismGovernorSchema = new mongoose.Schema({

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
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

tourismGovernorSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
    next();
}
);

tourismGovernorSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const TourismGovernor = mongoose.model('TourismGovernor', tourismGovernorSchema);

export default TourismGovernor;


=======
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const tourismGovernorSchema = new mongoose.Schema({

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
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

tourismGovernorSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
    next();
}
);

tourismGovernorSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const TourismGovernor = mongoose.model('TourismGovernor', tourismGovernorSchema);

export default TourismGovernor;


>>>>>>> jwtdemo
