import * as enrollmentService from "./enrollment.service.js";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";

/**
 * POST /enroll/:courseId — Student enrolls in a free course.
 */
export const enroll = catchAsync(async (req, res) => {
  const data = await enrollmentService.enrollInCourse(
    req.user._id,
    req.params.courseId
  );
  sendResponse(res, 201, "Enrolled successfully", data);
});

/**
 * POST /enroll/:courseId/payment — Enroll after payment confirmation.
 */
export const enrollWithPayment = catchAsync(async (req, res) => {
  const { paymentId, amount } = req.body;
  const data = await enrollmentService.enrollAfterPayment(
    req.user._id,
    req.params.courseId,
    paymentId,
    amount
  );
  sendResponse(res, 201, "Enrollment confirmed after payment", data);
});

/**
 * GET /enrollments/my — Get current student's enrollments.
 */
export const getMyEnrollments = catchAsync(async (req, res) => {
  const data = await enrollmentService.getMyEnrollments(
    req.user._id,
    req.query
  );
  sendResponse(res, 200, "Enrollments fetched", data);
});

/**
 * GET /enroll/:courseId/check — Check if enrolled in a course.
 */
export const checkEnrollment = catchAsync(async (req, res) => {
  const data = await enrollmentService.checkEnrollment(
    req.user._id,
    req.params.courseId
  );
  sendResponse(res, 200, "Enrollment status checked", data);
});

/**
 * GET /enrollments/course/:courseId — Admin: get all enrollments for a course.
 */
export const getCourseEnrollments = catchAsync(async (req, res) => {
  const data = await enrollmentService.getCourseEnrollments(
    req.params.courseId,
    req.query
  );
  sendResponse(res, 200, "Course enrollments fetched", data);
});

/**
 * POST /enroll/:courseId/cancel — Student cancels enrollment.
 */
export const cancelEnrollment = catchAsync(async (req, res) => {
  const data = await enrollmentService.cancelEnrollment(
    req.user._id,
    req.params.courseId
  );
  sendResponse(res, 200, "Enrollment cancelled", data);
});
