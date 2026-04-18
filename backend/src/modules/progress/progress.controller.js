import * as progressService from "./progress.service.js";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import AppError from "../../utils/AppError.js";
import Enrollment from "../enrollment/enrollment.model.js";
import Course from "../course/course.model.js";
import { generateCertificate } from "../../utils/certificateService.js";

/**
 * POST /progress/:courseId/lessons/:lessonId/complete — Mark lesson as complete.
 */
export const markComplete = catchAsync(async (req, res) => {
  const data = await progressService.markLessonComplete(
    req.user._id,
    req.params.courseId,
    req.params.lessonId
  );
  sendResponse(res, 200, "Lesson marked as complete", data);
});

/**
 * PUT /progress/:courseId/lessons/:lessonId/watch — Update watch time.
 */
export const updateWatchTime = catchAsync(async (req, res) => {
  const data = await progressService.updateWatchTime(
    req.user._id,
    req.params.courseId,
    req.params.lessonId,
    req.body.watchedSeconds
  );
  sendResponse(res, 200, "Watch time updated", data);
});

/**
 * GET /progress/:courseId — Get course progress (completion %).
 */
export const getCourseProgress = catchAsync(async (req, res) => {
  const data = await progressService.getCourseProgress(
    req.user._id,
    req.params.courseId
  );
  sendResponse(res, 200, "Course progress fetched", data);
});

/**
 * POST /progress/:courseId/lessons/:lessonId/reset — Reset lesson progress.
 */
export const resetProgress = catchAsync(async (req, res) => {
  const data = await progressService.resetLessonProgress(
    req.user._id,
    req.params.courseId,
    req.params.lessonId
  );
  sendResponse(res, 200, "Lesson progress reset", data);
});

/**
 * GET /progress/:courseId/certificate — Download completion certificate.
 */
export const downloadCertificate = catchAsync(async (req, res) => {
  const { courseId } = req.params;

  // Verify course is completed
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: courseId,
    status: "completed",
  });

  if (!enrollment) {
    throw new AppError(
      "You must complete the course to download a certificate",
      403
    );
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const cert = await generateCertificate(req.user, course);

  sendResponse(res, 200, "Certificate generated", {
    certificateUrl: cert.url,
    certificateId: cert.certId,
  });
});
