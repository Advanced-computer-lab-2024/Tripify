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

// Define a schema for file uploads
const fileSchema = new mongoose.Schema({
  filename: String,
  path: String,
  mimetype: String,
  size: Number,
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

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
    // New fields for profile picture and documents
    profilePicture: {
      type: fileSchema,
    },
    identificationDocument: {
      type: fileSchema,
      // required: [true, "Identification document is required"],
      validate: {
        validator: function (file) {
          const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
          return allowedTypes.includes(file.mimetype);
        },
        message: "ID document must be PDF, JPEG, or PNG",
      },
    },
    certificate: {
      type: fileSchema,
      // required: [true, "Certificate is required"],
      validate: {
        validator: function (file) {
          const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
          return allowedTypes.includes(file.mimetype);
        },
        message: "Certificate must be PDF, JPEG, or PNG",
      },
    },
    previousWork: [previousWorkSchema],
    reviews: [reviewSchema],
    isVerified: {
      type: Boolean,
      default: false,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    documents: [
      {
        type: {
          type: String,
          enum: [
            "tourGuidelicense",
            "identityProof",
            "certifications",
            "other",
          ],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    rejectionReason: {
      type: String,
    },
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
tourGuideSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
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
