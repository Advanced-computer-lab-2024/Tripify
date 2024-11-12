import Activity from "../models/activity.model.js";

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

// Get all activities
export const getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.aggregate([
      {
        $lookup: {
          from: "advertisers",
          localField: "createdBy",
          foreignField: "_id",
          as: "advertiser"
        }
      },
      {
        $match: {
          "advertiser.isActive": true, // Ensure the owner's account is active
          advertiser: { $ne: [] }, // Ensure there's an associated advertiser
          flagged: { $ne: true }   // Exclude flagged activities
        }
      },
      {
        $lookup: {
          from: "activitycategories",
          localField: "category",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: "$category" },
      {
        $lookup: {
          from: "tags",
          localField: "preferenceTags",
          foreignField: "_id",
          as: "preferenceTags"
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          createdBy: { $arrayElemAt: ["$advertiser.username", 0] }, // Display only the advertiser's username
          category: "$category.name",
          preferenceTags: "$preferenceTags.name",
          flagged: 1
        }
      }
    ]);

    res.status(200).json(activities);
  } catch (error) {
    console.error("Error in getAllActivities:", error);
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

    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { $set: { flagged: flagged } },
      { new: true, runValidators: true }
    )
      .populate("category")
      .populate("tags");

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.status(200).json(activity);
  } catch (error) {
    console.error("Error in flagActivity:", error);
    res.status(500).json({ message: error.message });
  }
};
