import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { HiOutlineSearch, HiOutlineStar, HiOutlineUsers, HiOutlineBookOpen } from 'react-icons/hi';

const CourseCard = ({ course }) => (
  <Link
    to={`/courses/${course._id}`}
    className="glass rounded-2xl overflow-hidden group hover:bg-white/10 block"
  >
    {/* Thumbnail */}
    <div className="h-44 bg-gradient-to-br from-primary/30 to-surface-light overflow-hidden">
      {course.thumbnailUrl ? (
        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <HiOutlineBookOpen className="w-12 h-12 text-primary/40" />
        </div>
      )}
    </div>

    {/* Content */}
    <div className="p-5">
      {/* Category badge */}
      {course.category?.name && (
        <span className="inline-block px-2.5 py-1 text-xs font-medium bg-primary/15 text-primary-light rounded-full mb-3">
          {course.category.name}
        </span>
      )}

      <h3 className="text-lg font-semibold text-white group-hover:text-primary-light line-clamp-2 mb-2">
        {course.title}
      </h3>

      <p className="text-sm text-gray-400 line-clamp-2 mb-4">
        {course.description}
      </p>

      {/* Meta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          {(course.averageRating || 0) > 0 && (
            <span className="flex items-center gap-1">
              <HiOutlineStar className="w-4 h-4 text-yellow-400" />
              {Number(course.averageRating).toFixed(1)}
            </span>
          )}
          {(course.totalReviews || 0) > 0 && (
            <span className="flex items-center gap-1">
              <HiOutlineUsers className="w-4 h-4" />
              {course.totalReviews}
            </span>
          )}
        </div>
        <span className={`text-lg font-bold ${(course.price || 0) === 0 ? 'text-green-400' : 'text-white'}`}>
          {(course.price || 0) === 0 ? 'Free' : `₹${course.price}`}
        </span>
      </div>
    </div>
  </Link>
);

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Debounce search input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch categories
  useEffect(() => {
    api.get('/categories').then(({ data }) => {
      setCategories(data.data || []);
    }).catch(() => {});
  }, []);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 9 };
        if (debouncedSearch) params.search = debouncedSearch;
        if (selectedCategory) params.category = selectedCategory;

        const { data } = await api.get('/courses', { params });
        const result = data.data || data;
        setCourses(Array.isArray(result) ? result : result.courses || []);
        setPagination(result.pagination || {});
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [page, debouncedSearch, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Explore Courses</h1>
        <p className="text-gray-400 mt-1">Find the perfect course for your learning goals</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
        </div>

        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 focus:outline-none focus:border-primary appearance-none cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id} className="bg-[#1e1b4b]">
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
              <div className="h-44 bg-white/5" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-white/5 rounded w-1/3" />
                <div className="h-5 bg-white/5 rounded w-3/4" />
                <div className="h-4 bg-white/5 rounded w-full" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20">
          <HiOutlineBookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-xl text-gray-400">No courses found</p>
          <p className="text-gray-500 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 glass rounded-lg text-sm disabled:opacity-30 hover:bg-white/10"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-400">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 glass rounded-lg text-sm disabled:opacity-30 hover:bg-white/10"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Courses;
