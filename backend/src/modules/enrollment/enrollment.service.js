import Enrollment from "./enrollment.model.js";
import Course from "../course/course.model.js";
import User from "../auth/user.model.js";
import AppError from "../../utils/AppError.js";
import { sendEnrollmentEmail } from "../../utils/emailService.js";

/**
 * Enroll a student in a course (free or paid).
 */
export const enrollInCourse = async (studentId, courseId) => {
  // 1. Check course exists and is published
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (!course.isPublished) {
    throw new AppError("Course is not available for enrollment", 400);
  }

  // 2. Check if already enrolled
  const existing = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  });

  if (existing) {
    throw new AppError("You are already enrolled in this course", 409);
  }

  // 3. Determine enrollment type
  const isFree = course.price === 0;

  if (!isFree) {
    // For paid courses, we return info needed to initiate payment
    // Actual payment integration would happen in a payment module
    throw new AppError(
      "This is a paid course. Please use the payment endpoint to enroll.",
      402
    );
  }

  // 4. Create enrollment for free courses
  const enrollment = await Enrollment.create({
    student: studentId,
    course: courseId,
    enrollmentType: "free",
    amountPaid: 0,
    status: "active",
  });

  const populated = await enrollment.populate([
    { path: "course", select: "title description thumbnailUrl price" },
    { path: "student", select: "name email" },
  ]);

  // Send enrollment email (non-blocking)
  sendEnrollmentEmail(populated.student, populated.course).catch(() => {});

  return populated;
};

/**
 * Enroll via payment (called after payment is confirmed).
 * In a real app, this would be triggered by a payment webhook.
 */
export const enrollAfterPayment = async (
  studentId,
  courseId,
  paymentId,
  amount
) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  // Check if already enrolled
  const existing = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  });

  if (existing) {
    throw new AppError("You are already enrolled in this course", 409);
  }

  const enrollment = await Enrollment.create({
    student: studentId,
    course: courseId,
    enrollmentType: "paid",
    amountPaid: amount || course.price,
    paymentId,
    status: "active",
  });

  const populated = await enrollment.populate([
    { path: "course", select: "title description thumbnailUrl price" },
    { path: "student", select: "name email" },
  ]);

  // Send enrollment email (non-blocking)
  sendEnrollmentEmail(populated.student, populated.course).catch(() => {});

  return populated;
};

/**
 * Get all enrollments for the current student.
 */
export const getMyEnrollments = async (studentId, query) => {
  const { page = 1, limit = 10, status } = query;

  const filter = { student: studentId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [enrollments, total] = await Promise.all([
    Enrollment.find(filter)
      .populate({
        path: "course",
        select: "title description thumbnailUrl price isPublished category",
        populate: { path: "category", select: "name" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Enrollment.countDocuments(filter),
  ]);

  return {
    enrollments,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Check if a student is enrolled in a specific course.
 */
export const checkEnrollment = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: "active",
  });

  return {
    isEnrolled: !!enrollment,
    enrollment: enrollment || null,
  };
};

/**
 * Get all enrollments for a course (admin).
 */
export const getCourseEnrollments = async (courseId, query) => {
  const { page = 1, limit = 20 } = query;

  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const filter = { course: courseId };
  const skip = (page - 1) * limit;

  const [enrollments, total] = await Promise.all([
    Enrollment.find(filter)
      .populate("student", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Enrollment.countDocuments(filter),
  ]);

  return {
    enrollments,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Cancel enrollment (student cancels own enrollment).
 */
export const cancelEnrollment = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: "active",
  });

  if (!enrollment) {
    throw new AppError("Active enrollment not found", 404);
  }

  enrollment.status = "cancelled";
  await enrollment.save();

  return enrollment;
};
