import * as reviewService from "./review.service.js";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";

/**
 * POST /reviews/:courseId — Create or update a review.
 */
export const createReview = catchAsync(async (req, res) => {
  const data = await reviewService.createReview(
    req.user._id,
    req.params.courseId,
    req.body
  );
  sendResponse(res, 201, "Review submitted", data);
});

/**
 * GET /reviews/:courseId — Get all reviews for a course.
 */
export const getCourseReviews = catchAsync(async (req, res) => {
  const data = await reviewService.getCourseReviews(
    req.params.courseId,
    req.query
  );
  sendResponse(res, 200, "Reviews fetched", data);
});

/**
 * GET /reviews/:courseId/my — Get current student's review.
 */
export const getMyReview = catchAsync(async (req, res) => {
  const data = await reviewService.getMyReview(
    req.user._id,
    req.params.courseId
  );
  sendResponse(res, 200, "Review fetched", data);
});

/**
 * DELETE /reviews/:courseId — Delete a review.
 */
export const deleteReview = catchAsync(async (req, res) => {
  await reviewService.deleteReview(
    req.user._id,
    req.params.courseId,
    req.user.role
  );
  sendResponse(res, 200, "Review deleted");
});
