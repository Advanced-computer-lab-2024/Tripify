import express from "express";
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  toggleStatus,
  addReply,
  getComplaintsByUser  // Add this new controller
} from "../controllers/complaints.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import Complaint from "../models/complaints.model.js";

const router = express.Router();

router.post("/", authMiddleware, createComplaint);
router.get("/", getComplaints);
router.get("/user/:userId", authMiddleware, getComplaintsByUser); // Add this new route
router.get("/:id", getComplaintById);
router.put("/:id", updateComplaint);
router.delete("/:id", deleteComplaint);
router.patch("/:id/status", toggleStatus);
router.post("/:id/reply", addReply);

export default router;