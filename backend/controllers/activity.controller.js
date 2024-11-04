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

// GET all activities
export const getActivities = async (req, res) => {
  try {
    const isAdmin = req.user?.role === "admin";
    const query = isAdmin ? {} : { flagged: { $ne: true } };

    const activities = await Activity.find(query)
      .populate("createdBy", "username companyName")
      .populate("category")
      .populate("tags");
    res.status(200).json(activities);
  } catch (error) {
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
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { flagged: req.body.flagged },
      { new: true }
    );

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
