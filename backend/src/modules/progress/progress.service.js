import Progress from "./progress.model.js";
import Lesson from "../lesson/lesson.model.js";
import Enrollment from "../enrollment/enrollment.model.js";
import Course from "../course/course.model.js";
import User from "../auth/user.model.js";
import AppError from "../../utils/AppError.js";
import { generateCertificate } from "../../utils/certificateService.js";
import { sendCompletionEmail } from "../../utils/emailService.js";

/**
 * Mark a lesson as complete (or update watch time).
 */
export const markLessonComplete = async (studentId, courseId, lessonId) => {
  // 1. Verify enrollment
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: "active",
  });

  if (!enrollment) {
    throw new AppError("You are not enrolled in this course", 403);
  }

  // 2. Verify lesson belongs to course
  const lesson = await Lesson.findOne({ _id: lessonId, course: courseId });
  if (!lesson) {
    throw new AppError("Lesson not found in this course", 404);
  }

  // 3. Upsert progress record
  const progress = await Progress.findOneAndUpdate(
    { student: studentId, lesson: lessonId },
    {
      student: studentId,
      course: courseId,
      lesson: lessonId,
      isCompleted: true,
      completedAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return progress;
};

/**
 * Update watch time for a lesson (video resume support).
 */
export const updateWatchTime = async (
  studentId,
  courseId,
  lessonId,
  watchedSeconds
) => {
  // Verify enrollment
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: "active",
  });

  if (!enrollment) {
    throw new AppError("You are not enrolled in this course", 403);
  }

  // Verify lesson belongs to course
  const lesson = await Lesson.findOne({ _id: lessonId, course: courseId });
  if (!lesson) {
    throw new AppError("Lesson not found in this course", 404);
  }

  const progress = await Progress.findOneAndUpdate(
    { student: studentId, lesson: lessonId },
    {
      student: studentId,
      course: courseId,
      lesson: lessonId,
      watchedSeconds,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return progress;
};

/**
 * Get course progress for a student (completion %).
 */
export const getCourseProgress = async (studentId, courseId) => {
  // Verify enrollment
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: { $in: ["active", "completed"] },
  });

  if (!enrollment) {
    throw new AppError("You are not enrolled in this course", 403);
  }

  // Count total lessons in course
  const totalLessons = await Lesson.countDocuments({ course: courseId });

  if (totalLessons === 0) {
    return {
      courseId,
      totalLessons: 0,
      completedLessons: 0,
      progressPercent: 0,
      lessons: [],
    };
  }

  // Count completed lessons
  const completedLessons = await Progress.countDocuments({
    student: studentId,
    course: courseId,
    isCompleted: true,
  });

  // Get per-lesson progress
  const lessons = await Lesson.find({ course: courseId })
    .sort({ sortOrder: 1 })
    .lean();

  const progressRecords = await Progress.find({
    student: studentId,
    course: courseId,
  }).lean();

  // Map progress to lessons
  const progressMap = new Map(
    progressRecords.map((p) => [p.lesson.toString(), p])
  );

  const lessonProgress = lessons.map((lesson) => {
    const prog = progressMap.get(lesson._id.toString());
    return {
      lessonId: lesson._id,
      title: lesson.title,
      sortOrder: lesson.sortOrder,
      isCompleted: prog?.isCompleted || false,
      watchedSeconds: prog?.watchedSeconds || 0,
      completedAt: prog?.completedAt || null,
    };
  });

  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  // Auto-mark enrollment as completed if 100%
  if (progressPercent === 100 && enrollment.status === "active") {
    enrollment.status = "completed";
    enrollment.completedAt = new Date();
    await enrollment.save();

    // Send completion email + generate certificate (non-blocking)
    const user = await User.findById(studentId);
    const course = await Course.findById(courseId);
    if (user && course) {
      sendCompletionEmail(user, course).catch(() => {});
      generateCertificate(user, course).catch(() => {});
    }
  }

  return {
    courseId,
    totalLessons,
    completedLessons,
    progressPercent,
    isCompleted: progressPercent === 100,
    lessons: lessonProgress,
  };
};

/**
 * Reset progress for a lesson (un-complete).
 */
export const resetLessonProgress = async (studentId, courseId, lessonId) => {
  const progress = await Progress.findOneAndUpdate(
    { student: studentId, lesson: lessonId, course: courseId },
    { isCompleted: false, completedAt: null, watchedSeconds: 0 },
    { new: true }
  );

  if (!progress) {
    throw new AppError("No progress found for this lesson", 404);
  }

  // If enrollment was marked completed, revert to active
  await Enrollment.findOneAndUpdate(
    { student: studentId, course: courseId, status: "completed" },
    { status: "active", completedAt: null }
  );

  return progress;
};
