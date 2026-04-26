import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineCheckCircle, HiOutlinePlay, HiOutlineDownload,
  HiOutlineArrowLeft, HiOutlineBookOpen, HiOutlineRefresh
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

const CourseProgress = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

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
      const { data } = await api.post(`/progress/${courseId}/lessons/${lessonId}/complete`);
      // Re-fetch full progress to get updated percentages
      const { data: progressRes } = await api.get(`/progress/${courseId}`);
      setProgress(progressRes.data);
      if (progressRes.data?.progressPercent === 100) {
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
      const { data } = await api.get(`/progress/${courseId}/certificate`);
      const certUrl = data.data?.certificateUrl;
      if (certUrl) {
        const baseURL = api.defaults.baseURL?.replace('/api/v1', '') || '';
        const fullUrl = certUrl.startsWith('http') ? certUrl : `${baseURL}${certUrl}`;
        window.open(fullUrl, '_blank');
        toast.success('Certificate opened!');
      } else {
        toast.error('Certificate URL not found');
      }
    } catch {
      toast.error('Certificate not available yet');
    }
  };

  const handleResetLesson = async (lessonId) => {
    try {
      await api.post(`/progress/${courseId}/lessons/${lessonId}/reset`);
      const { data: progressRes } = await api.get(`/progress/${courseId}`);
      setProgress(progressRes.data);
      toast.success('Lesson progress reset');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset');
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
          const embed = getVideoEmbed(lesson.videoUrl);
          const isActive = activeVideo === lesson._id;

          return (
            <div key={lesson._id}>
              <div className="flex items-center gap-4 px-5 py-4 hover:bg-white/5">
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

                {/* Video toggle */}
                {embed && (
                  <button
                    onClick={() => setActiveVideo(isActive ? null : lesson._id)}
                    className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary-light rounded-lg hover:bg-primary/20 flex items-center gap-1.5 shrink-0"
                  >
                    <HiOutlinePlay className="w-3.5 h-3.5" />
                    {isActive ? 'Hide Video' : 'Watch'}
                  </button>
                )}

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
                      <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                    )}
                    Mark Done
                  </button>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-green-400 font-medium">✓ Done</span>
                    <button
                      onClick={() => handleResetLesson(lesson._id)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-yellow-400" title="Reset progress"
                    >
                      <HiOutlineRefresh className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Video Embed */}
              {isActive && embed && (
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
        })}
      </div>
    </div>
  );
};

export default CourseProgress;
