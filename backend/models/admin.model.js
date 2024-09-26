// Admin.js
import mongoose from "mongoose";
import BaseUser from "./BaseUser";

const adminSchema = new mongoose.Schema({
  adminLevel: {
    type: String,
    enum: ["junior", "senior", "super"],
    default: "super",
    required: true,
  },

  permissions: [
    {
      type: String,
      enum: [
        "manage-users",
        "manage-deals",
        "manage-bookings",
        "manage-finances",
        "manage-content",
        "manage-system",
        "view-analytics",
        "manage-activity-categories",
        "manage-preference-tags",
      ],
    },
  ],
  managedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BaseUser",
    },
  ],
  activityLog: [
    {
      action: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
      details: mongoose.Schema.Types.Mixed,
    },
  ],
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
  },
  notes: String,
});

adminSchema.methods.hasPermission = function (permission) {
  return this.permissions.includes(permission);
};

adminSchema.methods.logActivity = function (action, details) {
  this.activityLog.push({ action, details });
  return this.save();
};

adminSchema.methods.deactivate = function () {
  this.isActive = false;
  return this.save();
};

adminSchema.methods.promote = function () {
  const levels = ["junior", "senior", "super"];
  const currentIndex = levels.indexOf(this.adminLevel);
  if (currentIndex < levels.length - 1) {
    this.adminLevel = levels[currentIndex + 1];
    return this.save();
  }
  return Promise.reject(new Error("Already at highest admin level"));
};

adminSchema.statics.findActiveAdmins = function () {
  return this.find({ isActive: true });
};

const Admin = BaseUser.discriminator("Admin", adminSchema);

export default Admin;
