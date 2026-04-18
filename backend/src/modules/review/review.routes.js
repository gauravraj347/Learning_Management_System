import { Router } from "express";
import * as reviewController from "./review.controller.js";
import { createReviewValidation } from "./review.validator.js";
import validate from "../../middlewares/validate.js";
import { protect } from "../../middlewares/auth.js";

const router = Router();

// Public: get course reviews
router.get("/:courseId", reviewController.getCourseReviews);

// Protected: requires auth
router.post(
  "/:courseId",
  protect,
  createReviewValidation,
  validate,
  reviewController.createReview
);

router.get("/:courseId/my", protect, reviewController.getMyReview);

router.delete("/:courseId", protect, reviewController.deleteReview);

export default router;
