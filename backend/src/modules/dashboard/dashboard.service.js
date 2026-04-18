import Course from "../course/course.model.js";
import Enrollment from "../enrollment/enrollment.model.js";
import User from "../auth/user.model.js";
import Progress from "../progress/progress.model.js";
import Review from "../review/review.model.js";
import Lesson from "../lesson/lesson.model.js";
import AppError from "../../utils/AppError.js";

/**
 * Admin Dashboard — overall platform stats.
 */
export const getAdminDashboard = async () => {
  const [
    totalStudents,
    totalCourses,
    publishedCourses,
    totalEnrollments,
    totalReviews,
    revenueStats,
    popularCourses,
    recentEnrollments,
  ] = await Promise.all([
    // Total students
    User.countDocuments({ role: "student" }),

    // Total courses
    Course.countDocuments(),

    // Published courses
    Course.countDocuments({ isPublished: true }),

    // Total enrollments
    Enrollment.countDocuments(),

    // Total reviews
    Review.countDocuments(),

    // Revenue stats
    Enrollment.aggregate([
      { $match: { enrollmentType: "paid" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amountPaid" },
          paidEnrollments: { $sum: 1 },
        },
      },
    ]),

    // Top 5 popular courses (by enrollment count)
    Enrollment.aggregate([
      { $group: { _id: "$course", enrollments: { $sum: 1 } } },
      { $sort: { enrollments: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      {
        $project: {
          _id: 0,
          courseId: "$course._id",
          title: "$course.title",
          price: "$course.price",
          averageRating: "$course.averageRating",
          enrollments: 1,
        },
      },
    ]),

    // 5 most recent enrollments
    Enrollment.find()
      .populate("student", "name email")
      .populate("course", "title price")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const revenue = revenueStats[0] || { totalRevenue: 0, paidEnrollments: 0 };

  return {
    overview: {
      totalStudents,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      totalReviews,
      totalRevenue: revenue.totalRevenue,
      paidEnrollments: revenue.paidEnrollments,
    },
    popularCourses,
    recentEnrollments,
  };
};

/**
 * Student Dashboard — enrolled courses with progress.
 */
export const getStudentDashboard = async (studentId) => {
  // Get all active/completed enrollments
  const enrollments = await Enrollment.find({
    student: studentId,
    status: { $in: ["active", "completed"] },
  })
    .populate({
      path: "course",
      select: "title description thumbnailUrl price averageRating totalReviews category",
      populate: { path: "category", select: "name" },
    })
    .sort({ createdAt: -1 })
    .lean();

  // Get progress for each enrolled course
  const coursesWithProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
      const courseId = enrollment.course._id;

      const totalLessons = await Lesson.countDocuments({ course: courseId });
      const completedLessons = await Progress.countDocuments({
        student: studentId,
        course: courseId,
        isCompleted: true,
      });

      const progressPercent =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      return {
        enrollmentId: enrollment._id,
        enrolledAt: enrollment.createdAt,
        status: enrollment.status,
        course: enrollment.course,
        progress: {
          totalLessons,
          completedLessons,
          progressPercent,
        },
      };
    })
  );

  // Summary stats
  const totalEnrolled = coursesWithProgress.length;
  const completedCourses = coursesWithProgress.filter(
    (c) => c.progress.progressPercent === 100
  ).length;
  const inProgressCourses = coursesWithProgress.filter(
    (c) => c.progress.progressPercent > 0 && c.progress.progressPercent < 100
  ).length;

  return {
    summary: {
      totalEnrolled,
      completedCourses,
      inProgressCourses,
      notStarted: totalEnrolled - completedCourses - inProgressCourses,
    },
    courses: coursesWithProgress,
  };
};
