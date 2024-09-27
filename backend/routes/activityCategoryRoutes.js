import express from "express";
import * as activityCategoryController from "../controllers/activityCategoryController.js";

const router = express.Router();

router.post("/", activityCategoryController.createCategory);
router.get("/", activityCategoryController.getAllCategories);
router.get("/:id", activityCategoryController.getCategory);
router.put("/:id", activityCategoryController.updateCategory);
router.delete("/:id", activityCategoryController.deleteCategory);

export default router;
