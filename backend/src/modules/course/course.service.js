import Course from "./course.model.js";
import Lesson from "../lesson/lesson.model.js";
import AppError from "../../utils/AppError.js";

/**
 * Create a new course (admin only).
 */
export const createCourse = async (data, userId) => {
  const course = await Course.create({ ...data, createdBy: userId });
  return course;
};

/**
 * Get all published courses (public).
 * Supports: search, category filter, pagination.
 */
export const getAllCourses = async (query) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    showAll = false, // admin flag to see drafts
  } = query;

  const filter = {};

  if (!showAll) filter.isPublished = true;

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (category) filter.category = category;

  const skip = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate("category", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Course.countDocuments(filter),
  ]);

  return {
    courses,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single course by ID with its lessons.
 */
export const getCourseById = async (id) => {
  const course = await Course.findById(id)
    .populate("category", "name")
    .populate("createdBy", "name email");

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const lessons = await Lesson.find({ course: id }).sort({ sortOrder: 1 });

  return { course, lessons };
};

/**
 * Update a course (admin only).
 */
export const updateCourse = async (id, data) => {
  const course = await Course.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  return course;
};

/**
 * Soft-delete a course (admin only).
 */
export const deleteCourse = async (id) => {
  const course = await Course.findByIdAndUpdate(
    id,
    { isDeleted: true, isPublished: false },
    { new: true }
  );

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  return course;
};
