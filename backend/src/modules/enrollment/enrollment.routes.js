import { Router } from "express";
import * as enrollmentController from "./enrollment.controller.js";
import { enrollPaymentValidation } from "./enrollment.validator.js";
import validate from "../../middlewares/validate.js";
import { protect, authorize } from "../../middlewares/auth.js";

const router = Router();

// ── Student Routes ─────────────────────────────────────
// All enrollment routes require auth
router.use(protect);

// Get my enrollments (student)
router.get("/my", enrollmentController.getMyEnrollments);

// Enroll in a free course
router.post("/:courseId", enrollmentController.enroll);

// Enroll after payment (paid course)
router.post(
  "/:courseId/payment",
  enrollPaymentValidation,
  validate,
  enrollmentController.enrollWithPayment
);

// Check enrollment status for a course
router.get("/:courseId/check", enrollmentController.checkEnrollment);

// Cancel enrollment
router.post("/:courseId/cancel", enrollmentController.cancelEnrollment);

// ── Admin Routes ───────────────────────────────────────
// Get all enrollments for a specific course (admin only)
router.get(
  "/course/:courseId",
  authorize("admin"),
  enrollmentController.getCourseEnrollments
);

export default router;
