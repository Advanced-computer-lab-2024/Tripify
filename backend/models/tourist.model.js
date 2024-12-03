import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Define the Preferences Schema
const preferenceSchema = new mongoose.Schema({
  tripTypes: [
    {
      type: String,
      enum: [
        "historic",
        "beaches",
        "shopping",
        "family-friendly",
        "adventures",
        "luxury",
        "budget-friendly",
      ],
    },
  ],
  budgetLimit: {
    type: Number,
  },
  preferredDestinations: {
    type: String,
    trim: true,
  },
});

// Define the Address Schema
const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true
  },
  street: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  postalCode: {
    type: String,
    required: true,
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Define the Tourist Schema
const touristSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true,
  },
  nationality: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
    immutable: true,
  },
  jobStatus: {
    type: String,
    enum: ["student", "job"],
    required: true,
  },
  jobTitle: {
    type: String,
    required: function () {
      return this.jobStatus === "job";
    },
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isUnderage: {
    type: Boolean,
    default: false,
  },
  wallet: {
    type: Number,
    default: 0,
  },
  preferences: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PreferenceTag",
      },
    ],
    default: [],
  },
  loyaltypoints: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 0,
  },
  savedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  // Add delivery addresses
  deliveryAddresses: [addressSchema]
});

// Pre-save hook to hash the password
touristSchema.pre("save", async function (next) {
  const tourist = this;

  if (tourist.isModified("password")) {
    tourist.password = await bcrypt.hash(tourist.password, 10);
  }

  const age = new Date().getFullYear() - tourist.dob.getFullYear();
  tourist.isUnderage = age < 18;

  // Ensure only one default address
  if (tourist.isModified('deliveryAddresses')) {
    const defaultAddresses = tourist.deliveryAddresses.filter(addr => addr.isDefault);
    if (defaultAddresses.length > 1) {
      // Keep only the last default address
      for (let i = 0; i < defaultAddresses.length - 1; i++) {
        defaultAddresses[i].isDefault = false;
      }
    }
    // If no default address and there are addresses, make the first one default
    if (defaultAddresses.length === 0 && tourist.deliveryAddresses.length > 0) {
      tourist.deliveryAddresses[0].isDefault = true;
    }
  }

  next();
});

// Method to compare password
touristSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to add a new address
touristSchema.methods.addDeliveryAddress = async function(addressData) {
  // If this is the first address, make it default
  if (this.deliveryAddresses.length === 0) {
    addressData.isDefault = true;
  }

  // If setting as default, remove default from other addresses
  if (addressData.isDefault) {
    this.deliveryAddresses.forEach(addr => {
      addr.isDefault = false;
    });
  }

  this.deliveryAddresses.push(addressData);
  return this.save();
};

// Method to update an address
touristSchema.methods.updateDeliveryAddress = async function(addressId, updateData) {
  const address = this.deliveryAddresses.id(addressId);
  if (!address) {
    throw new Error('Address not found');
  }

  // If setting as default, remove default from other addresses
  if (updateData.isDefault) {
    this.deliveryAddresses.forEach(addr => {
      addr.isDefault = false;
    });
  }

  Object.assign(address, updateData);
  return this.save();
};

// Method to delete an address
touristSchema.methods.deleteDeliveryAddress = async function(addressId) {
  const address = this.deliveryAddresses.id(addressId);
  if (!address) {
    throw new Error('Address not found');
  }

  const wasDefault = address.isDefault;
  address.remove();

  // If deleted address was default, make first remaining address default
  if (wasDefault && this.deliveryAddresses.length > 0) {
    this.deliveryAddresses[0].isDefault = true;
  }

  return this.save();
};

const Tourist = mongoose.model("Tourist", touristSchema);

export default Tourist;