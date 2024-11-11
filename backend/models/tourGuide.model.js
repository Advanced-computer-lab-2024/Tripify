import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Define a schema for previous work experience
const previousWorkSchema = new mongoose.Schema(
  {
    jobTitle: {
      type: String,
      trim: true,
      required: true,
    },
    company: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: false,
    },
    startDate: {
      type: Date,
      required: false,
    },
    endDate: {
      type: Date,
      required: false,
    },
  },
  { _id: false }
);

// Define a schema for reviews
const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      required: false,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tourist",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Define the main TourGuide schema
const tourGuideSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      trim: true,
      match: [/^\+?[1-20]\d{1,14}$/, "Please enter a valid mobile number"],
    },
    yearsOfExperience: {
      type: Number,
      min: [0, "Years of experience cannot be negative"],
      max: [50, "Unrealistic value for years of experience"],
    },
    previousWork: [previousWorkSchema],
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

// Virtual field for calculating average rating
tourGuideSchema.virtual("averageRating").get(function () {
  if (this.reviews.length === 0) return 0;
  const totalRating = this.reviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  return totalRating / this.reviews.length;
});

// Pre-save hook to hash the password
tourGuideSchema.pre("save", function (next) {
  next();
});

// Method to compare password
tourGuideSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
};

// Export the model with a check for existing compilation
export default mongoose.models.TourGuide ||
  mongoose.model("TourGuide", tourGuideSchema);
//
