import Wishlist from "./wishlist.model.js";
import Course from "../course/course.model.js";
import AppError from "../../utils/AppError.js";

/**
 * Add a course to wishlist.
 */
export const addToWishlist = async (studentId, courseId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  // Check if already in wishlist
  const existing = await Wishlist.findOne({
    student: studentId,
    course: courseId,
  });

  if (existing) {
    throw new AppError("Course already in your wishlist", 409);
  }

  const item = await Wishlist.create({
    student: studentId,
    course: courseId,
  });

  return item.populate("course", "title description price thumbnailUrl averageRating");
};

/**
 * Remove a course from wishlist.
 */
export const removeFromWishlist = async (studentId, courseId) => {
  const item = await Wishlist.findOneAndDelete({
    student: studentId,
    course: courseId,
  });

  if (!item) {
    throw new AppError("Course not found in your wishlist", 404);
  }

  return item;
};

/**
 * Get all wishlist items for a student.
 */
export const getMyWishlist = async (studentId, query) => {
  const { page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Wishlist.find({ student: studentId })
      .populate({
        path: "course",
        select: "title description price thumbnailUrl averageRating totalReviews isPublished category",
        populate: { path: "category", select: "name" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Wishlist.countDocuments({ student: studentId }),
  ]);

  return {
    wishlist: items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Check if a course is in the student's wishlist.
 */
export const checkWishlist = async (studentId, courseId) => {
  const item = await Wishlist.findOne({
    student: studentId,
    course: courseId,
  });

  return { isWishlisted: !!item };
};
