import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  HiOutlineStar, HiOutlineBookOpen, HiOutlineClock, HiOutlinePlay,
  HiOutlineLockClosed, HiOutlineCheckCircle, HiOutlineHeart, HiOutlineUsers,
  HiOutlineTrash, HiOutlinePencil
} from 'react-icons/hi';

// Convert any video URL to embeddable format
// Supports: YouTube, Vimeo, Dailymotion, and direct video links
const getVideoEmbed = (url) => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname;

    // YouTube
    if (host.includes('youtu.be')) {
      return { type: 'iframe', src: `https://www.youtube.com/embed/${urlObj.pathname.slice(1)}` };
    }
    if (host.includes('youtube.com')) {
      const id = urlObj.searchParams.get('v');
      if (id) return { type: 'iframe', src: `https://www.youtube.com/embed/${id}` };
    }

    // Vimeo
    if (host.includes('vimeo.com')) {
      const id = urlObj.pathname.split('/').filter(Boolean).pop();
      if (id) return { type: 'iframe', src: `https://player.vimeo.com/video/${id}` };
    }

    // Dailymotion
    if (host.includes('dailymotion.com')) {
      const id = urlObj.pathname.split('/').pop()?.replace('video_', '');
      if (id) return { type: 'iframe', src: `https://www.dailymotion.com/embed/video/${id}` };
    }
    if (host.includes('dai.ly')) {
      return { type: 'iframe', src: `https://www.dailymotion.com/embed/video/${urlObj.pathname.slice(1)}` };
    }

    // Direct video file (mp4, webm, ogg)
    if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
      return { type: 'video', src: url };
    }

    // Fallback: try as iframe (works for many platforms like Loom, Google Drive embeds, etc.)
    return { type: 'iframe', src: url };
  } catch { return null; }
};

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
  const [activeVideo, setActiveVideo] = useState(null);

  // Review state
  const [myReview, setMyReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch course
        const { data: courseRes } = await api.get(`/courses/${id}`);
        const result = courseRes.data || courseRes;

        if (result.course) {
          setCourse(result.course);
          setLessons(result.lessons || []);
        } else {
          setCourse(result);
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

        // Authenticated checks
        if (user) {
          // Check enrollment
          try {
            const { data: enrollData } = await api.get(`/enrollments/${id}/check`);
            setEnrollment(enrollData.data?.isEnrolled ? enrollData.data.enrollment : null);
          } catch { setEnrollment(null); }

          // Check wishlist
          try {
            const { data: wishData } = await api.get(`/wishlist/${id}/check`);
            setWishlisted(wishData.data?.isWishlisted || false);
          } catch { setWishlisted(false); }

          // Get my review
          try {
            const { data: myRevData } = await api.get(`/reviews/${id}/my`);
            const rev = myRevData.data?.review || null;
            setMyReview(rev);
            if (rev) {
              setReviewForm({ rating: rev.rating, comment: rev.comment || '' });
            }
          } catch { setMyReview(null); }
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

  // Review handlers
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setSubmittingReview(true);
    try {
      const { data } = await api.post(`/reviews/${id}`, reviewForm);
      const newReview = data.data;
      toast.success(myReview ? 'Review updated!' : 'Review submitted! ⭐');
      setMyReview(newReview);
      setShowReviewForm(false);
      // Refresh reviews list
      const { data: reviewData } = await api.get(`/reviews/${id}`);
      const reviewResult = reviewData.data || reviewData;
      setReviews(Array.isArray(reviewResult) ? reviewResult : reviewResult.reviews || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!confirm('Delete your review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      toast.success('Review deleted');
      setMyReview(null);
      setReviewForm({ rating: 5, comment: '' });
      // Refresh reviews
      const { data: reviewData } = await api.get(`/reviews/${id}`);
      const reviewResult = reviewData.data || reviewData;
      setReviews(Array.isArray(reviewResult) ? reviewResult : reviewResult.reviews || []);
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
                onClick={() => navigate(`/progress/${id}`)}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl"
              >
                Continue Learning
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
            lessons.map((lesson, index) => {
              const embed = getVideoEmbed(lesson.videoUrl);
              const canWatch = enrollment || lesson.isFree;
              const isActive = activeVideo === lesson._id;

              return (
                <div key={lesson._id}>
                  <div
                    className={`flex items-center gap-4 px-5 py-4 hover:bg-white/5 cursor-pointer ${isActive ? 'bg-white/5' : ''}`}
                    onClick={() => {
                      if (canWatch && embed) {
                        setActiveVideo(isActive ? null : lesson._id);
                      } else if (!canWatch && !lesson.isFree) {
                        toast('Enroll to watch this lesson', { icon: '🔒' });
                      }
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary-light text-sm font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{lesson.title}</h4>
                      {lesson.content && (
                        <p className="text-sm text-gray-400 truncate">{lesson.content}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {embed && canWatch && (
                        <span className="flex items-center gap-1 text-xs text-primary-light">
                          <HiOutlinePlay className="w-4 h-4" />
                          {isActive ? 'Hide' : 'Watch'}
                        </span>
                      )}
                      {lesson.isFree ? (
                        <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded-full">Free</span>
                      ) : (
                        !enrollment && <HiOutlineLockClosed className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Video Embed */}
                  {isActive && embed && canWatch && (
                    <div className="px-5 pb-5">
                      <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                        {embed.type === 'video' ? (
                          <video
                            className="absolute inset-0 w-full h-full"
                            src={embed.src}
                            controls
                            controlsList="nodownload"
                          />
                        ) : (
                          <iframe
                            className="absolute inset-0 w-full h-full"
                            src={embed.src}
                            title={lesson.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* My Review / Write Review — only if enrolled */}
      {user && enrollment && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Your Review</h2>
            {!showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary-light rounded-lg hover:bg-primary/20 flex items-center gap-1.5"
              >
                <HiOutlinePencil className="w-4 h-4" />
                {myReview ? 'Edit Review' : 'Write Review'}
              </button>
            )}
          </div>

          {/* Existing review display */}
          {myReview && !showReviewForm && (
            <div className="glass rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-light">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{user.name}</p>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <HiOutlineStar
                          key={i}
                          className={`w-3.5 h-3.5 ${i < myReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleDeleteReview}
                  className="p-2 rounded-lg hover:bg-accent/10 text-gray-400 hover:text-accent"
                  title="Delete review"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
              {myReview.comment && <p className="text-gray-400 text-sm mt-3">{myReview.comment}</p>}
            </div>
          )}

          {/* Review form */}
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="glass rounded-xl p-5 space-y-4">
              {/* Star rating */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="p-0.5 hover:scale-110 transition-transform"
                    >
                      <HiOutlineStar
                        className={`w-7 h-7 ${star <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-400">{reviewForm.rating}/5</span>
                </div>
              </div>
              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Comment (optional)</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your experience with this course..."
                  rows={3}
                  maxLength={1000}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{reviewForm.comment.length}/1000</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1 py-3 glass hover:bg-white/10 rounded-xl text-gray-300 font-medium"
                >Cancel</button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-3 bg-primary hover:bg-primary-dark rounded-xl text-white font-medium disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : myReview ? 'Update Review' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}

          {/* No review yet and form not open */}
          {!myReview && !showReviewForm && (
            <div className="glass rounded-xl p-5 text-center text-gray-400">
              <p>You haven't reviewed this course yet.</p>
            </div>
          )}
        </section>
      )}

      {/* All Reviews */}
      {reviews.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Reviews ({reviews.length})</h2>
          <div className="space-y-4">
            {reviews.map((review) => (
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
