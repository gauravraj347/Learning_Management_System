import { Router } from "express";
import * as courseController from "./course.controller.js";
import {
  createCourseValidation,
  updateCourseValidation,
} from "./course.validator.js";
import validate from "../../middlewares/validate.js";
import { protect, authorize } from "../../middlewares/auth.js";
import { uploadThumbnail } from "../../middlewares/upload.js";
import lessonRoutes from "../lesson/lesson.routes.js";

const router = Router();

// ── Courses ─────────────────────────────────────────────
// Public
router.get("/", courseController.getAll);
router.get("/:id", courseController.getById);

// Admin only
router.post(
  "/",
  protect,
  authorize("admin"),
  createCourseValidation,
  validate,
  courseController.create
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateCourseValidation,
  validate,
  courseController.update
);

router.delete("/:id", protect, authorize("admin"), courseController.remove);

// ── Upload thumbnail ────────────────────────────────────
router.post(
  "/:id/thumbnail",
  protect,
  authorize("admin"),
  uploadThumbnail,
  courseController.uploadThumbnail
);

// ── Mount lesson routes as nested resource ──────────────
router.use("/:courseId/lessons", lessonRoutes);

export default router;
