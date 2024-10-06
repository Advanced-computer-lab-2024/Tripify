import express from "express";
import {
  createActivity,
  getActivities,
  updateActivity,
  getActivityById,
  deleteActivity,
} from "../controllers/activity.controller.js";
import {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/activityCategory.controller.js";

const router = express.Router();

// Category routes
router.post("/category", createCategory);
router.get("/category", getAllCategories);
router.get("/category/:id", getCategory);
router.put("/category/:id", updateCategory);
router.delete("/category/:id", deleteCategory);

// Activity routes
router.post("/", createActivity);
router.get("/", getActivities);
router.get("/:id", getActivityById);
router.put("/:id", updateActivity);
router.delete("/:id", deleteActivity);

export default router;
