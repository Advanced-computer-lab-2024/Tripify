    import mongoose from 'mongoose';

    const touristSchema = new mongoose.Schema({
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        wallet: { type: Number, default: 0 },
        name: { type: String, required: true },
        age: { type: Number, required: true },
        country: { type: String, required: true },
        bio: { type: String },
    });
    const Tourist =mongoose.model('Tourist',touristSchema);
    export default Tourist; 