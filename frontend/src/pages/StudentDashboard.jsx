import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineBookOpen, HiOutlineAcademicCap, HiOutlineChartBar, HiOutlineClock, HiOutlineXCircle } from 'react-icons/hi';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch dashboard stats
        const { data: dashData } = await api.get('/dashboard/student');
        setDashboard(dashData.data);

        // Fetch enrollments
        const { data: enrollData } = await api.get('/enrollments/my');
        setEnrollments(enrollData.data?.enrollments || enrollData.data || []);
      } catch {
        setDashboard(null);
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCancelEnrollment = async (courseId, courseTitle) => {
    if (!confirm(`Cancel enrollment in "${courseTitle}"? This cannot be undone.`)) return;
    try {
      await api.post(`/enrollments/${courseId}/cancel`);
      toast.success('Enrollment cancelled');
      setEnrollments(prev => prev.filter(e => (e.course?._id || e.course) !== courseId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-white/5 rounded w-1/3" />
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white/5 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  const stats = [
    {
      icon: HiOutlineBookOpen,
      label: 'Enrolled Courses',
      value: dashboard?.totalEnrolled || enrollments.length || 0,
      color: 'text-primary-light',
      bg: 'bg-primary/10',
    },
    {
      icon: HiOutlineAcademicCap,
      label: 'Completed',
      value: dashboard?.completedCourses || 0,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      icon: HiOutlineChartBar,
      label: 'In Progress',
      value: dashboard?.inProgressCourses || enrollments.filter(e => e.status === 'active').length || 0,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">My Learning</h1>
        <p className="text-gray-400 mt-1">Welcome back, {user?.name} 👋</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Enrolled Courses */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">My Courses</h2>
          <Link to="/courses" className="text-sm text-primary-light hover:text-primary">
            Browse more →
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <HiOutlineBookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400">No courses yet</p>
            <p className="text-gray-500 mt-1 mb-6">Start learning by enrolling in a course</p>
            <Link
              to="/courses"
              className="inline-flex px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              if (!course) return null;

              const progress = dashboard?.courses?.find(c =>
                c.courseId === course._id || c.course?._id === course._id
              );
              const progressPercent = progress?.progressPercent || 0;

              return (
                <Link
                  key={enrollment._id}
                  to={`/progress/${course._id}`}
                  className="glass rounded-2xl overflow-hidden group hover:bg-white/10 block"
                >
                  {/* Thumbnail */}
                  <div className="h-36 bg-gradient-to-br from-primary/30 to-surface-light overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <HiOutlineBookOpen className="w-10 h-10 text-primary/40" />
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    {course.category && (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-primary/15 text-primary-light rounded-full">
                        {course.category.name}
                      </span>
                    )}

                    <h3 className="text-white font-semibold group-hover:text-primary-light line-clamp-1">
                      {course.title}
                    </h3>

                    {/* Progress bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-gray-400">{progressPercent}% complete</span>
                        <span className={`font-medium ${
                          enrollment.status === 'completed' ? 'text-green-400' : 'text-primary-light'
                        }`}>
                          {enrollment.status === 'completed' ? '✅ Done' : 'In Progress'}
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            progressPercent === 100
                              ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                              : 'bg-gradient-to-r from-primary to-primary-light'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Cancel button (only for active enrollments) */}
                    {enrollment.status === 'active' && (
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCancelEnrollment(course._id, course.title); }}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-accent font-medium pt-1"
                      >
                        <HiOutlineXCircle className="w-3.5 h-3.5" /> Cancel Enrollment
                      </button>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentDashboard;
