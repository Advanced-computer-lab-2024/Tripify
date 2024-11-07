import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  problem: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now, // Automatically sets the date to the current date if not provided
  },
  status: {
    type: String,
    enum: ["pending", "resolved"], // Allows only 'pending' or 'resolved' values
    default: "pending", // Sets the default status to 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tourist',
    required: true
  },
  replies: [
    {
      replyText: { type: String, required: true },
      replyDate: { type: Date, default: Date.now },
    },
  ],
  user: {
    username: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
  },
});

// Export the Complaint model
const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;
