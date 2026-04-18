import Lesson from "./lesson.model.js";
import Course from "../course/course.model.js";
import AppError from "../../utils/AppError.js";

/**
 * Add a lesson to a course.
 */
export const createLesson = async (courseId, data) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  // Auto-set sortOrder if not provided
  if (data.sortOrder === undefined) {
    const lastLesson = await Lesson.findOne({ course: courseId }).sort({
      sortOrder: -1,
    });
    data.sortOrder = lastLesson ? lastLesson.sortOrder + 1 : 0;
  }

  const lesson = await Lesson.create({ ...data, course: courseId });
  return lesson;
};

/**
 * Get all lessons for a course.
 */
export const getLessonsByCourse = async (courseId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  return Lesson.find({ course: courseId }).sort({ sortOrder: 1 });
};

/**
 * Get a single lesson by ID.
 */
export const getLessonById = async (courseId, lessonId) => {
  const lesson = await Lesson.findOne({ _id: lessonId, course: courseId });

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  return lesson;
};

/**
 * Update a lesson.
 */
export const updateLesson = async (courseId, lessonId, data) => {
  const lesson = await Lesson.findOneAndUpdate(
    { _id: lessonId, course: courseId },
    data,
    { new: true, runValidators: true }
  );

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  return lesson;
};

/**
 * Delete a lesson (hard delete).
 */
export const deleteLesson = async (courseId, lessonId) => {
  const lesson = await Lesson.findOneAndDelete({
    _id: lessonId,
    course: courseId,
  });

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  return lesson;
};
