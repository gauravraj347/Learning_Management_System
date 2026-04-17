import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineCheckCircle, HiOutlinePlay, HiOutlineDownload,
  HiOutlineArrowLeft, HiOutlineBookOpen
} from 'react-icons/hi';

const CourseProgress = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [courseRes, lessonRes, progressRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/courses/${courseId}/lessons`),
          api.get(`/progress/${courseId}`),
        ]);
        setCourse(courseRes.data.data);
        setLessons(lessonRes.data.data || []);
        setProgress(progressRes.data.data);
      } catch {
        toast.error('Failed to load progress');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const handleMarkComplete = async (lessonId) => {
    setMarking(lessonId);
    try {
      const { data } = await api.put(`/progress/${courseId}/lesson/${lessonId}`);
      setProgress(data.data);
      if (data.data.progressPercent === 100) {
        toast.success('🎉 Course completed! Certificate generated!');
      } else {
        toast.success('Lesson marked as complete');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setMarking(null);
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      const response = await api.get(`/progress/${courseId}/certificate`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${courseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded!');
    } catch {
      toast.error('Certificate not available yet');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/5 rounded w-1/3" />
        <div className="h-4 bg-white/5 rounded w-1/4" />
        <div className="h-64 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (!course) return null;

  const completedLessons = progress?.completedLessons || [];
  const progressPercent = progress?.progressPercent || 0;
  const isCompleted = progressPercent === 100;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm">
        <HiOutlineArrowLeft className="w-4 h-4" /> Back to My Learning
      </Link>

      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{course.title}</h1>
            <p className="text-gray-400 text-sm mt-1">{lessons.length} lessons</p>
          </div>

          {isCompleted && (
            <button
              onClick={handleDownloadCertificate}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm font-medium hover:bg-green-500/20"
            >
              <HiOutlineDownload className="w-5 h-5" /> Download Certificate
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">{completedLessons.length} of {lessons.length} complete</span>
            <span className={`font-bold ${isCompleted ? 'text-green-400' : 'text-primary-light'}`}>
              {progressPercent}%
            </span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isCompleted
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                  : 'bg-gradient-to-r from-primary to-primary-light'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lesson List */}
      <div className="glass rounded-2xl divide-y divide-white/5">
        {lessons.map((lesson, index) => {
          const isLessonDone = completedLessons.some(
            (cl) => (cl.lesson || cl) === lesson._id || cl.lesson?._id === lesson._id
          );

          return (
            <div key={lesson._id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5">
              {/* Number / Check */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isLessonDone ? 'bg-green-500/10' : 'bg-white/5'
              }`}>
                {isLessonDone ? (
                  <HiOutlineCheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <span className="text-sm font-bold text-gray-500">{index + 1}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium truncate ${isLessonDone ? 'text-gray-400 line-through' : 'text-white'}`}>
                  {lesson.title}
                </h4>
                {lesson.content && (
                  <p className="text-xs text-gray-500 truncate">{lesson.content}</p>
                )}
              </div>

              {/* Action */}
              {!isLessonDone ? (
                <button
                  onClick={() => handleMarkComplete(lesson._id)}
                  disabled={marking === lesson._id}
                  className="px-4 py-2 text-xs font-medium bg-primary/10 text-primary-light rounded-lg hover:bg-primary/20 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  {marking === lesson._id ? (
                    <div className="w-3.5 h-3.5 border-2 border-primary-light/30 border-t-primary-light rounded-full animate-spin" />
                  ) : (
                    <HiOutlinePlay className="w-3.5 h-3.5" />
                  )}
                  Mark Done
                </button>
              ) : (
                <span className="text-xs text-green-400 font-medium shrink-0">✓ Completed</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseProgress;
