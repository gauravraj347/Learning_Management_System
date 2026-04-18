import { Router } from "express";
import * as lessonController from "./lesson.controller.js";
import {
  createLessonValidation,
  updateLessonValidation,
} from "./lesson.validator.js";
import validate from "../../middlewares/validate.js";
import { protect, authorize } from "../../middlewares/auth.js";

const router = Router({ mergeParams: true }); // mergeParams to access :courseId

// Public
router.get("/", lessonController.getAll);
router.get("/:id", lessonController.getById);

// Admin only
router.post(
  "/",
  protect,
  authorize("admin"),
  createLessonValidation,
  validate,
  lessonController.create
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateLessonValidation,
  validate,
  lessonController.update
);

router.delete("/:id", protect, authorize("admin"), lessonController.remove);

export default router;
