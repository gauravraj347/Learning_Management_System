import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', price: 0, category: '', isPublished: true,
  });

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses');
      setCourses(data.data?.courses || data.data || []);
    } catch { setCourses([]); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.data || []);
    } catch {}
  };

  useEffect(() => { fetchCourses(); fetchCategories(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', price: 0, category: categories[0]?._id || '', isPublished: true });
    setShowModal(true);
  };

  const openEdit = (course) => {
    setEditing(course);
    setForm({
      title: course.title,
      description: course.description || '',
      price: course.price || 0,
      category: course.category?._id || course.category || '',
      isPublished: course.isPublished !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/courses/${editing._id}`, form);
        toast.success('Course updated');
      } else {
        await api.post('/courses', form);
        toast.success('Course created');
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Course deleted');
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Courses</h1>
          <p className="text-gray-400 mt-1">Manage your courses</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2.5 bg-primary hover:bg-primary-dark rounded-xl text-sm font-medium text-white flex items-center gap-2">
          <HiOutlinePlus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-gray-400">
          <p className="text-xl mb-2">No courses yet</p>
          <p className="text-sm">Create your first course to get started</p>
        </div>
      ) : (
        <div className="glass rounded-2xl divide-y divide-white/5">
          {courses.map((course) => (
            <div key={course._id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5">
              {/* Thumbnail */}
              <div className="w-16 h-12 rounded-lg bg-primary/10 overflow-hidden shrink-0">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary/30 text-xs">IMG</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-medium truncate">{course.title}</h3>
                  {course.isPublished ? (
                    <span className="px-2 py-0.5 text-xs bg-green-500/10 text-green-400 rounded-full">Published</span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs bg-yellow-500/10 text-yellow-400 rounded-full">Draft</span>
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  {course.category?.name || 'No category'} · {course.price === 0 ? 'Free' : `₹${course.price}`}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Link to={`/courses/${course._id}`} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                  <HiOutlineEye className="w-4 h-4" />
                </Link>
                <button onClick={() => openEdit(course)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-primary-light">
                  <HiOutlinePencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(course._id)} className="p-2 rounded-lg hover:bg-accent/10 text-gray-400 hover:text-accent">
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
              <h2 className="text-xl font-bold text-white">{editing ? 'Edit Course' : 'New Course'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}
                  required placeholder="e.g. Node.js Masterclass"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
                  required placeholder="Course description..." rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Price (₹)</label>
                  <input
                    type="number" min="0" value={form.price}
                    onChange={(e) => setForm({...form, price: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                  <select
                    value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 focus:outline-none focus:border-primary"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id} className="bg-[#1e1b4b]">{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({...form, isPublished: !form.isPublished})}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isPublished ? 'bg-primary' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${form.isPublished ? 'left-5.5 translate-x-0' : 'left-0.5'}`} />
                </button>
                <span className="text-sm text-gray-300">{form.isPublished ? 'Published' : 'Draft'}</span>
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

export default ManageCourses;
