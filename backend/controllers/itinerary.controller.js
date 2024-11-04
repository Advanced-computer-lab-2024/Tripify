import Itinerary from "../models/itinerary.model.js";

// Create an itinerary
export const createItinerary = async (req, res) => {
  try {
    const { itineraryData, tourGuideId } = req.body;
    console.log("Creating itinerary with data:", {
      itineraryData,
      tourGuideId,
    });

    const itinerary = await Itinerary.createItinerary(
      itineraryData,
      tourGuideId
    );

    console.log("Created itinerary:", itinerary);
    res.status(201).json(itinerary);
  } catch (error) {
    console.error("Error creating itinerary:", error);
    res.status(400).json({ message: error.message });
  }
};

// Get a single itinerary by ID
export const getItineraryById = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id)
      .populate("bookings")
      .populate("createdBy", "name")
      .populate("timeline.activity", "name")
      .populate("preferenceTags", "name");

    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }
    res.status(200).json(itinerary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all itineraries

export const getAllItineraries = async (req, res) => {
  try {
    const itineraries = await Itinerary.find()
      .populate("createdBy", "username")
      .populate("preferenceTags", "name")
      .select("+flagged"); // Explicitly include flagged field

    res.status(200).json(itineraries);
  } catch (error) {
    console.error("Error in getAllItineraries:", error);
    res.status(500).json({ message: error.message });
  }
};
// Update an itinerary by ID
export const updateItinerary = async (req, res) => {
  try {
    const updatedItinerary = await Itinerary.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("createdBy", "name")
      .populate("timeline.activity", "name")
      .populate("preferenceTags", "name");

    if (!updatedItinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }
    res.status(200).json(updatedItinerary);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an itinerary by ID
export const deleteItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }
    // This needs to be fixed in the model
    // if (!itinerary.canDelete()) {
    //     return res.status(400).json({ message: 'Cannot delete itinerary with existing bookings' });
    // }
    await itinerary.deleteOne(); // Use document deleteOne to trigger pre-hook
    res.status(200).json({ message: "Itinerary deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search itineraries
export const searchItineraries = async (req, res) => {
  try {
    const { query } = req.query;
    const itineraries = await Itinerary.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { pickupLocation: { $regex: query, $options: "i" } },
        { dropoffLocation: { $regex: query, $options: "i" } },
      ],
      isActive: true,
    })
      .populate("createdBy", "name")
      .populate("timeline.activity", "name")
      .populate("preferenceTags", "name");

    res.status(200).json(itineraries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const flagItinerary = async (req, res) => {
  try {
    const { flagged } = req.body;

    const itinerary = await Itinerary.findByIdAndUpdate(
      req.params.id,
      { $set: { flagged: flagged } },
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name")
      .populate("preferenceTags", "name");

    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    res.status(200).json(itinerary);
  } catch (error) {
    console.error("Error in flagItinerary:", error);
    res.status(500).json({ message: error.message });
  }
};
