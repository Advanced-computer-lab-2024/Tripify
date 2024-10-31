import express from "express";
import {
  createPreferenceTag,
  getPreferenceTags,
  getPreferenceTagById,
  updatePreferenceTag,
  deletePreferenceTag,
} from "../controllers/preferenceTag.controller.js";

const router = express.Router();

router.post("/", createPreferenceTag);
router.get("/", getPreferenceTags);
router.get("/:id", getPreferenceTagById);
router.put("/:id", updatePreferenceTag);
router.delete("/:id", deletePreferenceTag);

export default router;
