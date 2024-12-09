import Complaint from "../models/complaints.model.js"

// CREATE a new complaint
export const createComplaint = async (req, res) => {
  try {
    const complaint = new Complaint(req.body);
    await complaint.save();
    res.status(201).json(complaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET all complaints
export const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET a single complaint by ID
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.status(200).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE a complaint by ID
export const updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.status(200).json(complaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE a complaint by ID
export const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleStatus = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Toggle the status between 'pending' and 'resolved'
    const newStatus = complaint.status === "pending" ? "resolved" : "pending";

    // Update the status in the database and return the updated document
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: newStatus },
      { new: true } // Return the updated document
    );

    res.status(200).json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const addReply = async (req, res) => {
  try {
    const { replyText } = req.body;

    // Find the complaint and push the new reply to the replies array
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $push: { replies: { replyText } } },
      { new: true } // Return the updated document
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add this to your complaints.controller.js file

export const getComplaintsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify that the authenticated user is requesting their own complaints
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to view these complaints" });
    }

    const complaints = await Complaint.find({ createdBy: userId })
      .sort({ date: -1 }) // Sort by date, newest first
      .exec();

    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error fetching user complaints:", error);
    res.status(500).json({ message: "Error fetching complaints", error: error.message });
  }
};
