import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  HiOutlineCurrencyRupee, HiOutlineCheckCircle, HiOutlineXCircle,
  HiOutlineClock, HiOutlineArrowLeft
} from 'react-icons/hi';

const statusConfig = {
  paid: { color: 'text-green-400', bg: 'bg-green-500/10', label: 'Paid' },
  created: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Pending' },
  failed: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Failed' },
  refunded: { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Refunded' },
};

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 20 };
        if (statusFilter) params.status = statusFilter;
        const { data } = await api.get('/payments/all', { params });
        const result = data.data || data;
        setPayments(result.payments || []);
        setPagination(result.pagination || {});

        // Calculate total from paid payments
        const paid = (result.payments || []).filter(p => p.status === 'paid');
        setTotalRevenue(paid.reduce((sum, p) => sum + (p.amount || 0), 0));
      } catch {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [page, statusFilter]);

  return (
    <div className="space-y-6">
      <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm">
        <HiOutlineArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">All Payments</h1>
          <p className="text-gray-400 mt-1">{pagination.total || 0} transactions</p>
        </div>
        <div className="glass rounded-xl px-5 py-3 flex items-center gap-3">
          <HiOutlineCurrencyRupee className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-xs text-gray-400">Page Revenue</p>
            <p className="text-lg font-bold text-green-400">₹{totalRevenue}</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['', 'paid', 'created', 'failed', 'refunded'].map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-primary text-white'
                : 'glass text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : payments.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-gray-400">
          <p className="text-xl">No payments found</p>
        </div>
      ) : (
        <div className="glass rounded-2xl divide-y divide-white/5">
          {payments.map((payment) => {
            const config = statusConfig[payment.status] || statusConfig.created;
            return (
              <div key={payment._id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5">
                <div className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{payment.course?.title || 'Course'}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {payment.student?.name || 'Student'} · {payment.student?.email || ''}
                  </p>
                </div>
                <div className="text-xs text-gray-400 shrink-0 hidden sm:block">
                  {new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white font-bold">₹{payment.amount}</p>
                  <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 glass rounded-lg text-sm disabled:opacity-30 hover:bg-white/10">Previous</button>
          <span className="px-4 py-2 text-sm text-gray-400">Page {page} of {pagination.pages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="px-4 py-2 glass rounded-lg text-sm disabled:opacity-30 hover:bg-white/10">Next</button>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
