import mongoose from "mongoose";
import Itinerary from "../models/itinerary.model.js";
import ItineraryComment from "../models/itineraryComment.model.js";
import TourGuide from '../models/tourGuide.model.js';  // Adjust path as needed
import sendEmail from '../utils/sendEmail.js';
import Notification from '../models/notification.model.js';


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
    
    // Fetch itinerary with creator information
    const itinerary = await Itinerary.findByIdAndUpdate(
      req.params.id,
      { $set: { flagged: flagged } },
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email")  // Add email to the populated fields
      .populate("preferenceTags", "name");

    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    // Get tour guide's information
    const tourGuide = await TourGuide.findById(itinerary.createdBy);
    
    if (tourGuide && tourGuide.email) {
      // Send email notification
      const subject = 'Itinerary Flagged Notification';
      const text = `Your itinerary "${itinerary.name}" has been flagged for review.`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Itinerary Flagged Notification</h2>
          <p>Hello ${tourGuide.name || 'Tour Guide'},</p>
          <p>Your itinerary has been flagged for review:</p>
          <div style="background-color: #f8f8f8; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Itinerary Details:</h3>
            <ul>
              <li><strong>Name:</strong> ${itinerary.name}</li>
              <li><strong>Tags:</strong> ${itinerary.preferenceTags.map(tag => tag.name).join(', ') || 'N/A'}</li>
              <li><strong>Status:</strong> Flagged</li>
            </ul>
          </div>
          <p>Our team will review the itinerary and take appropriate action if necessary.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>The Tripify Team</p>
        </div>
      `;

      await sendEmail(tourGuide.email, subject, text, html);

      // Create system notification
      const notification = new Notification({
        recipient: {
          userId: tourGuide._id,
          userType: 'TourGuide'
        },
        title: '⚠️ Itinerary Flagged',
        message: `Your itinerary "${itinerary.name}" has been flagged for review.`,
        type: 'SYSTEM_NOTIFICATION',
        priority: 'high',
        // relatedId: itinerary._id,
        // relatedModel: 'Itinerary',
        link: `/tour-guide/itineraries/${itinerary._id}`  // Adjust link based on your frontend routes
      });

      await notification.save();
    }

    res.status(200).json(itinerary);
  } catch (error) {
    console.error("Error in flagItinerary:", error);
    res.status(500).json({ message: error.message });
  }
};


export const addComment = async (req, res) => {
  try {
    const { itineraryId } = req.params;
    const { content } = req.body;
    const touristId = req.user._id;

    const comment = new ItineraryComment({
      tourist: touristId,
      itinerary: itineraryId,
      content,
    });

    await comment.save();

    // Populate tourist information before sending response
    await comment.populate("tourist", "username");

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const { itineraryId } = req.params;

    const comments = await ItineraryComment.find({ itinerary: itineraryId })
      .populate("tourist", "username")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: error.message });
  }
};
