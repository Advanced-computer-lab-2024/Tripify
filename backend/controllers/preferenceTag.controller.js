import PreferenceTag from "../models/preferenceTag.model.js";

export const createPreferenceTag = async (req, res) => {
  try {
    const preferenceTag = new PreferenceTag(req.body);
    await preferenceTag.save();
    res.status(201).json(preferenceTag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPreferenceTags = async (req, res) => {
  try {
    const preferenceTags = await PreferenceTag.find();
    res.status(200).json(preferenceTags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPreferenceTagById = async (req, res) => {
  try {
    const preferenceTag = await PreferenceTag.findById(req.params.id);
    if (!preferenceTag) {
      return res.status(404).json({ message: "Preference tag not found" });
    }
    res.status(200).json(preferenceTag);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePreferenceTag = async (req, res) => {
  try {
    const preferenceTag = await PreferenceTag.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!preferenceTag) {
      return res.status(404).json({ message: "Preference tag not found" });
    }
    res.status(200).json(preferenceTag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePreferenceTag = async (req, res) => {
  try {
    const preferenceTag = await PreferenceTag.findByIdAndDelete(req.params.id);
    if (!preferenceTag) {
      return res.status(404).json({ message: "Preference tag not found" });
    }
    res.status(200).json({ message: "Preference tag deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
