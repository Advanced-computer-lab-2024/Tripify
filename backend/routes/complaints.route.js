import express from "express";
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  toggleStatus,
  addReply
} from "../controllers/complaints.controller.js";

const router = express.Router();

router.post("/", createComplaint);
router.get("/", getComplaints);
router.get("/:id", getComplaintById);
router.put("/:id", updateComplaint);
router.delete("/:id", deleteComplaint);
router.patch("/:id/status", toggleStatus);

// New route to add a reply
router.post("/:id/reply", addReply);

export default router;
