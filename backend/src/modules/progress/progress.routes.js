import { Router } from "express";
import * as progressController from "./progress.controller.js";
import { updateWatchTimeValidation } from "./progress.validator.js";
import validate from "../../middlewares/validate.js";
import { protect } from "../../middlewares/auth.js";

const router = Router();

// All progress routes require authentication
router.use(protect);

// Get course progress (completion %)
router.get("/:courseId", progressController.getCourseProgress);

// Mark a lesson as complete
router.post(
  "/:courseId/lessons/:lessonId/complete",
  progressController.markComplete
);

// Update watch time for a lesson
router.put(
  "/:courseId/lessons/:lessonId/watch",
  updateWatchTimeValidation,
  validate,
  progressController.updateWatchTime
);

// Reset lesson progress
router.post(
  "/:courseId/lessons/:lessonId/reset",
  progressController.resetProgress
);

// Download completion certificate
router.get("/:courseId/certificate", progressController.downloadCertificate);

export default router;
