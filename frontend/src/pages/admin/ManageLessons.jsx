import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX,
  HiOutlineArrowLeft, HiOutlinePlay, HiOutlineBookOpen, HiOutlineEye
} from 'react-icons/hi';

const ManageLessons = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', content: '', videoUrl: '', sortOrder: 0, isFree: false,
  });

  const fetchData = async () => {
    try {
      const [courseRes, lessonRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/courses/${courseId}/lessons`),
      ]);
      const courseData = courseRes.data.data;
      setCourse(courseData?.course || courseData);
      setLessons(lessonRes.data.data || []);
    } catch {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [courseId]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: '', content: '', videoUrl: '',
      sortOrder: lessons.length,
      isFree: false,
    });
    setShowModal(true);
  };

  const openEdit = (lesson) => {
    setEditing(lesson);
    setForm({
      title: lesson.title,
      content: lesson.content || '',
      videoUrl: lesson.videoUrl || '',
      sortOrder: lesson.sortOrder || 0,
      isFree: lesson.isFree || false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/courses/${courseId}/lessons/${editing._id}`, form);
        toast.success('Lesson updated');
      } else {
        await api.post(`/courses/${courseId}/lessons`, form);
        toast.success('Lesson created');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (lessonId) => {
    if (!confirm('Delete this lesson? This cannot be undone.')) return;
    try {
      await api.delete(`/courses/${courseId}/lessons/${lessonId}`);
      toast.success('Lesson deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/5 rounded w-1/3" />
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link to="/admin/courses" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm">
        <HiOutlineArrowLeft className="w-4 h-4" /> Back to Courses
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Lessons</h1>
          <p className="text-gray-400 mt-1">{course?.title || 'Course'} · {lessons.length} lessons</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2.5 bg-primary hover:bg-primary-dark rounded-xl text-sm font-medium text-white flex items-center gap-2">
          <HiOutlinePlus className="w-4 h-4" /> Add Lesson
        </button>
      </div>

      {/* Lesson List */}
      {lessons.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-gray-400">
          <HiOutlineBookOpen className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-xl mb-2">No lessons yet</p>
          <p className="text-sm">Add your first lesson to this course</p>
        </div>
      ) : (
        <div className="glass rounded-2xl divide-y divide-white/5">
          {lessons.map((lesson, index) => (
            <div key={lesson._id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5">
              {/* Number */}
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary-light text-sm font-bold shrink-0">
                {index + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-medium truncate">{lesson.title}</h3>
                  {lesson.isFree && (
                    <span className="px-2 py-0.5 text-xs bg-green-500/10 text-green-400 rounded-full">Free</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                  {lesson.videoUrl && (
                    <span className="flex items-center gap-1">
                      <HiOutlinePlay className="w-3 h-3" /> Video
                    </span>
                  )}
                  {lesson.content && <span>Has content</span>}
                  <span>Order: {lesson.sortOrder}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(lesson)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-primary-light">
                  <HiOutlinePencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(lesson._id)} className="p-2 rounded-lg hover:bg-accent/10 text-gray-400 hover:text-accent">
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-lg border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">{editing ? 'Edit Lesson' : 'New Lesson'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
                <input
                  value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}
                  required placeholder="e.g. Introduction to React"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
                <textarea
                  value={form.content} onChange={(e) => setForm({...form, content: e.target.value})}
                  placeholder="Lesson text content (markdown supported)..." rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Video URL</label>
                <input
                  value={form.videoUrl} onChange={(e) => setForm({...form, videoUrl: e.target.value})}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Sort Order</label>
                  <input
                    type="number" min="0" value={form.sortOrder}
                    onChange={(e) => setForm({...form, sortOrder: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => setForm({...form, isFree: !form.isFree})}
                      className={`relative w-11 h-6 rounded-full transition-colors ${form.isFree ? 'bg-green-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${form.isFree ? 'left-5.5 translate-x-0' : 'left-0.5'}`} />
                    </button>
                    <span className="text-sm text-gray-300">{form.isFree ? 'Free Preview' : 'Paid Only'}</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 glass hover:bg-white/10 rounded-xl text-gray-300 font-medium">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-primary hover:bg-primary-dark rounded-xl text-white font-medium disabled:opacity-50">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLessons;
