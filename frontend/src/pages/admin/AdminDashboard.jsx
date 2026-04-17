import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  HiOutlineCurrencyRupee, HiOutlineUsers, HiOutlineBookOpen,
  HiOutlineAcademicCap, HiOutlineCollection, HiOutlineStar
} from 'react-icons/hi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/dashboard/admin');
        setStats(data.data);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-white/5 rounded w-1/3" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-white/5 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const cards = [
    { icon: HiOutlineCurrencyRupee, label: 'Total Revenue', value: `₹${stats?.totalRevenue || 0}`, color: 'text-green-400', bg: 'bg-green-500/10' },
    { icon: HiOutlineUsers, label: 'Total Students', value: stats?.totalStudents || 0, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: HiOutlineBookOpen, label: 'Total Courses', value: stats?.totalCourses || 0, color: 'text-primary-light', bg: 'bg-primary/10' },
    { icon: HiOutlineAcademicCap, label: 'Enrollments', value: stats?.totalEnrollments || 0, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Platform overview and management</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/categories" className="px-4 py-2.5 glass hover:bg-white/10 rounded-xl text-sm font-medium text-gray-300 flex items-center gap-2">
            <HiOutlineCollection className="w-4 h-4" /> Categories
          </Link>
          <Link to="/admin/courses" className="px-4 py-2.5 bg-primary hover:bg-primary-dark rounded-xl text-sm font-medium text-white flex items-center gap-2">
            <HiOutlineBookOpen className="w-4 h-4" /> Courses
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-gray-400">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Popular Courses */}
      {stats?.popularCourses?.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Popular Courses</h2>
          <div className="glass rounded-2xl divide-y divide-white/5">
            {stats.popularCourses.map((course, i) => (
              <div key={course._id || i} className="flex items-center gap-4 px-5 py-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary-light text-sm font-bold">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">{course.title}</h4>
                  <p className="text-xs text-gray-400">{course.enrollmentCount || 0} enrollments</p>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <HiOutlineStar className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">{course.averageRating?.toFixed(1) || 'N/A'}</span>
                </div>
                <span className={`text-sm font-bold ${course.price === 0 ? 'text-green-400' : 'text-white'}`}>
                  {course.price === 0 ? 'Free' : `₹${course.price}`}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminDashboard;
