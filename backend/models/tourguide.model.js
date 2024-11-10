import mongoose from "mongoose";
import bcrypt from "bcrypt";

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
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Method to update ratings
tourGuideSchema.methods.updateRatings = async function () {
  const Booking = mongoose.model("Booking");
  const ratings = await Booking.getGuideRatings(this._id);

  this.ratings = {
    average: ratings.averageRating,
    count: ratings.totalRatings,
  };

  await this.save();
  return this.ratings;
};

// Pre-save hook for password
tourGuideSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

tourGuideSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const TourGuide = mongoose.model("TourGuide", tourGuideSchema);

export default TourGuide;
