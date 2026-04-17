import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineHeart, HiOutlineBookOpen, HiOutlineStar, HiOutlineTrash } from 'react-icons/hi';

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/wishlist');
      setItems(data.data?.wishlist || data.data || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWishlist(); }, []);

  const handleRemove = async (courseId) => {
    try {
      await api.delete(`/wishlist/${courseId}`);
      setItems(items.filter(item => (item.course?._id || item.course) !== courseId));
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/5 rounded w-1/3" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-white/5 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <HiOutlineHeart className="w-8 h-8 text-accent" /> My Wishlist
        </h1>
        <p className="text-gray-400 mt-1">{items.length} saved course{items.length !== 1 ? 's' : ''}</p>
      </div>

      {items.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <HiOutlineHeart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-xl text-gray-400">Your wishlist is empty</p>
          <p className="text-gray-500 mt-1 mb-6">Browse courses and save the ones you love</p>
          <Link to="/courses" className="inline-flex px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const course = item.course;
            if (!course) return null;

            return (
              <div key={item._id} className="glass rounded-2xl overflow-hidden group">
                <Link to={`/courses/${course._id}`}>
                  <div className="h-40 bg-gradient-to-br from-primary/30 to-surface-light overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <HiOutlineBookOpen className="w-10 h-10 text-primary/40" />
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4 space-y-3">
                  {course.category && (
                    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-primary/15 text-primary-light rounded-full">
                      {course.category.name || course.category}
                    </span>
                  )}

                  <Link to={`/courses/${course._id}`}>
                    <h3 className="text-white font-semibold group-hover:text-primary-light line-clamp-2">{course.title}</h3>
                  </Link>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      {course.averageRating > 0 && (
                        <span className="flex items-center gap-1">
                          <HiOutlineStar className="w-4 h-4 text-yellow-400" />
                          {course.averageRating.toFixed(1)}
                        </span>
                      )}
                      <span className={`font-bold ${course.price === 0 ? 'text-green-400' : 'text-white'}`}>
                        {course.price === 0 ? 'Free' : `₹${course.price}`}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemove(course._id)}
                      className="p-2 rounded-lg hover:bg-accent/10 text-gray-400 hover:text-accent"
                      title="Remove from wishlist"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
