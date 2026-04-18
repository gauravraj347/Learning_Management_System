import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  HiOutlineStar, HiOutlineBookOpen, HiOutlineClock, HiOutlinePlay,
  HiOutlineLockClosed, HiOutlineCheckCircle, HiOutlineHeart, HiOutlineUsers
} from 'react-icons/hi';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch course — backend returns { data: { course, lessons } }
        const { data: courseRes } = await api.get(`/courses/${id}`);
        const result = courseRes.data || courseRes;
        
        // Handle both shapes: { course, lessons } or just course object
        if (result.course) {
          setCourse(result.course);
          setLessons(result.lessons || []);
        } else {
          setCourse(result);
          // Fetch lessons separately if not included
          try {
            const { data: lessonData } = await api.get(`/courses/${id}/lessons`);
            setLessons(lessonData.data || []);
          } catch { setLessons([]); }
        }

        // Fetch reviews
        try {
          const { data: reviewData } = await api.get(`/reviews/${id}`);
          const reviewResult = reviewData.data || reviewData;
          setReviews(Array.isArray(reviewResult) ? reviewResult : reviewResult.reviews || []);
        } catch { setReviews([]); }

        // Check enrollment
        if (user) {
          try {
            const { data: enrollData } = await api.get(`/enrollments/check/${id}`);
            setEnrollment(enrollData.data?.isEnrolled ? enrollData.data.enrollment : null);
          } catch { setEnrollment(null); }

          // Check wishlist
          try {
            const { data: wishData } = await api.get(`/wishlist/${id}/check`);
            setWishlisted(wishData.data?.isWishlisted || false);
          } catch { setWishlisted(false); }
        }
      } catch {
        toast.error('Course not found');
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return; }
    setEnrolling(true);
    try {
      if ((course.price || 0) === 0) {
        await api.post(`/enrollments/${id}`);
        toast.success('Enrolled successfully! 🎉');
        setEnrollment({ status: 'active' });
      } else {
        // Create Razorpay order
        const { data } = await api.post(`/payments/create-order/${id}`);
        const orderData = data.data;

        const options = {
          key: orderData.keyId,
          amount: orderData.amountInPaise,
          currency: orderData.currency,
          name: 'LMS Pro',
          description: orderData.courseName,
          order_id: orderData.orderId,
          handler: async (response) => {
            try {
              await api.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              toast.success('Payment successful! Enrolled! 🎉');
              setEnrollment({ status: 'active' });
            } catch {
              toast.error('Payment verification failed');
            }
          },
          prefill: { name: user.name, email: user.email },
          theme: { color: '#6366f1' },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      if (wishlisted) {
        await api.delete(`/wishlist/${id}`);
        setWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await api.post(`/wishlist/${id}`);
        setWishlisted(true);
        toast.success('Added to wishlist ❤️');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-white/5 rounded w-2/3" />
        <div className="h-4 bg-white/5 rounded w-1/3" />
        <div className="h-64 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {course.category?.name && (
            <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/15 text-primary-light rounded-full">
              {course.category.name}
            </span>
          )}

          <h1 className="text-3xl sm:text-4xl font-bold text-white">{course.title || 'Untitled Course'}</h1>

          <p className="text-gray-400 text-lg">{course.description || ''}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            {(course.averageRating || 0) > 0 && (
              <span className="flex items-center gap-1.5">
                <HiOutlineStar className="w-5 h-5 text-yellow-400" />
                <strong className="text-white">{Number(course.averageRating).toFixed(1)}</strong>
                ({course.totalReviews || 0} reviews)
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <HiOutlineBookOpen className="w-5 h-5" />
              {lessons.length} lessons
            </span>
          </div>
        </div>

        {/* Enroll Card */}
        <div className="glass rounded-2xl p-6 space-y-4 h-fit lg:sticky lg:top-24">
          <div className="text-center">
            <span className={`text-4xl font-bold ${(course.price || 0) === 0 ? 'text-green-400' : 'text-white'}`}>
              {(course.price || 0) === 0 ? 'Free' : `₹${course.price}`}
            </span>
          </div>

          {enrollment ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 font-medium">
                <HiOutlineCheckCircle className="w-5 h-5" />
                Enrolled
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl"
              >
                Go to My Learning
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {enrolling ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (course.price || 0) === 0 ? (
                  'Enroll for Free'
                ) : (
                  `Buy Now — ₹${course.price}`
                )}
              </button>
              <button
                onClick={handleWishlist}
                className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
                  wishlisted
                    ? 'bg-accent/10 border border-accent/20 text-accent'
                    : 'glass hover:bg-white/10 text-gray-300'
                }`}
              >
                <HiOutlineHeart className={`w-5 h-5 ${wishlisted ? 'fill-accent' : ''}`} />
                {wishlisted ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lessons */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Course Content</h2>
        <div className="glass rounded-2xl divide-y divide-white/5">
          {lessons.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No lessons available yet.</div>
          ) : (
            lessons.map((lesson, index) => (
              <div key={lesson._id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary-light text-sm font-bold shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">{lesson.title}</h4>
                  {lesson.content && (
                    <p className="text-sm text-gray-400 truncate">{lesson.content}</p>
                  )}
                </div>
                <div className="shrink-0">
                  {lesson.isFree ? (
                    <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded-full">Free</span>
                  ) : (
                    <HiOutlineLockClosed className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Reviews</h2>
          <div className="space-y-4">
            {reviews.slice(0, 5).map((review) => (
              <div key={review._id} className="glass rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-light">
                    {review.student?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{review.student?.name || 'Student'}</p>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <HiOutlineStar
                          key={i}
                          className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {review.comment && <p className="text-gray-400 text-sm">{review.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CourseDetail;
