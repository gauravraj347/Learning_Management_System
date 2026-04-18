import Review from "./review.model.js";
import Course from "../course/course.model.js";
import Enrollment from "../enrollment/enrollment.model.js";
import AppError from "../../utils/AppError.js";

/**
 * Create or update a review for a course.
 */
export const createReview = async (studentId, courseId, { rating, comment }) => {
  // 1. Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  // 2. Verify student is enrolled
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: { $in: ["active", "completed"] },
  });

  if (!enrollment) {
    throw new AppError("You must be enrolled in this course to leave a review", 403);
  }

  // 3. Check if review already exists (update it)
  const existing = await Review.findOne({ student: studentId, course: courseId });

  if (existing) {
    existing.rating = rating;
    existing.comment = comment || existing.comment;
    await existing.save();
    return existing.populate("student", "name email");
  }

  // 4. Create new review
  const review = await Review.create({
    student: studentId,
    course: courseId,
    rating,
    comment,
  });

  return review.populate("student", "name email");
};

/**
 * Get all reviews for a course (public).
 */
export const getCourseReviews = async (courseId, query) => {
  const { page = 1, limit = 10 } = query;

  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const filter = { course: courseId };
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("student", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Review.countDocuments(filter),
  ]);

  return {
    reviews,
    averageRating: course.averageRating,
    totalReviews: course.totalReviews,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get the current student's review for a course.
 */
export const getMyReview = async (studentId, courseId) => {
  const review = await Review.findOne({
    student: studentId,
    course: courseId,
  }).populate("student", "name email");

  return { review: review || null };
};

/**
 * Delete a review (student deletes own, or admin deletes any).
 */
export const deleteReview = async (userId, courseId, userRole) => {
  const filter = { course: courseId };

  // Students can only delete their own review
  if (userRole !== "admin") {
    filter.student = userId;
  }

  const review = await Review.findOneAndDelete(filter);

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  return review;
};
