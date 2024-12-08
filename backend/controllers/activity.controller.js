import mongoose from "mongoose";
import Activity from "../models/activity.model.js";
import Advertiser from "../models/advertiser.model.js";
import sendEmail from "../utils/sendEmail.js";
import Notification from "../models/notification.model.js";


// CREATE a new activity
export const createActivity = async (req, res) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET all activities
export const getActivities = async (req, res) => {
  try {
    // Use aggregation to check if the advertiser exists
    const activities = await Activity.aggregate([
      {
        $lookup: {
          from: "advertisers", // Collection name is lowercase and plural
          localField: "createdBy",
          foreignField: "_id",
          as: "advertiser",
        },
      },
      {
        $match: {
          advertiser: { $ne: [] }, // Only get activities where advertiser exists
          flagged: { $ne: true }, // Exclude flagged activities
        },
      },
      {
        $lookup: {
          from: "activitycategories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $lookup: {
          from: "tags",
          localField: "tags",
          foreignField: "_id",
          as: "tags",
        },
      },
    ]);

    res.status(200).json(activities);
  } catch (error) {
    console.error("Error in getActivities:", error);
    res.status(500).json({ message: error.message });
  }
};
// GET a single activity by ID
export const getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate("category")
      .populate("tags");
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE an activity by ID
export const updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("category")
      .populate("tags");
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    res.status(200).json(activity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE an activity by ID
export const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const flagActivity = async (req, res) => {
  try {
    const { flagged } = req.body;
    
    // Fetch activity with creator information
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { $set: { flagged: flagged } },
      { new: true, runValidators: true }
    )
      .populate("category")
      .populate("tags")
      .populate("createdBy");  // Add this to get advertiser info

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    // Get advertiser's email
    const advertiser = await Advertiser.findById(activity.createdBy);
    
    if (advertiser && advertiser.email) {
      // Send email notification
      const subject = 'Activity Flagged Notification';
      const text = `Your activity "${activity.name}" has been flagged for review.`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Activity Flagged Notification</h2>
          <p>Hello ${advertiser.name || 'Advertiser'},</p>
          <p>Your activity has been flagged for review:</p>
          <div style="background-color: #f8f8f8; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Activity Details:</h3>
            <ul>
              <li><strong>Name:</strong> ${activity.name}</li>
              <li><strong>Category:</strong> ${activity.category?.name || 'N/A'}</li>
              <li><strong>Status:</strong> Flagged</li>
            </ul>
          </div>
          <p>Our team will review the activity and take appropriate action if necessary.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>The Tripify Team</p>
        </div>
      `;

      await sendEmail(advertiser.email, subject, text, html);

      // Create system notification
      const notification = new Notification({
        recipient: {
          userId: advertiser._id,
          userType: 'Advertiser'
        },
        title: '⚠️ Activity Flagged',
        message: `Your activity "${activity.name}" has been flagged for review.`,
        type: 'SYSTEM_NOTIFICATION',
        priority: 'high',
        // relatedId: activity._id,
        // relatedModel: 'Flag_Activity',
        link: `/advertiser/activities/${activity._id}`  // Adjust link based on your frontend routes
      });

      await notification.save();
    }

    res.status(200).json(activity);
  } catch (error) {
    console.error("Error in flagActivity:", error);
    res.status(500).json({ message: error.message });
  }
};