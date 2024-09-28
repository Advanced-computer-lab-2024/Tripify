import mongoose from 'mongoose';

// Connect to MongoDB
export const connectDB = async () => {
  try {
    // Log the MongoDB URI for debugging
    console.log('MongoDB URI:', process.env.MONGO_URI);

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      // Uncomment these options if needed
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    // Accessing the connection directly from mongoose.connection
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};
