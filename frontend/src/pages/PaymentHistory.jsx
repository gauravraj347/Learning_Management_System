import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { HiOutlineCreditCard, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock } from 'react-icons/hi';

const statusConfig = {
  paid: { icon: HiOutlineCheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Paid' },
  created: { icon: HiOutlineClock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Pending' },
  failed: { icon: HiOutlineXCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Failed' },
  refunded: { icon: HiOutlineCreditCard, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Refunded' },
};

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/payments/my', { params: { page, limit: 10 } });
        const result = data.data || data;
        setPayments(result.payments || []);
        setPagination(result.pagination || {});
      } catch {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [page]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/5 rounded w-1/3" />
        {[1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <HiOutlineCreditCard className="w-8 h-8 text-primary-light" /> Payment History
        </h1>
        <p className="text-gray-400 mt-1">{pagination.total || 0} total transactions</p>
      </div>

      {payments.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <HiOutlineCreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-xl text-gray-400">No payments yet</p>
          <p className="text-gray-500 mt-1 mb-6">Your purchase history will appear here</p>
          <Link to="/courses" className="inline-flex px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="glass rounded-2xl divide-y divide-white/5">
          {payments.map((payment) => {
            const config = statusConfig[payment.status] || statusConfig.created;
            const StatusIcon = config.icon;
            return (
              <div key={payment._id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5">
                {/* Status Icon */}
                <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                  <StatusIcon className={`w-5 h-5 ${config.color}`} />
                </div>

                {/* Course Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">
                    {payment.course?.title || 'Course'}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                    <span>Order: {payment.razorpayOrderId?.slice(-10) || 'N/A'}</span>
                    <span>{new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Amount & Status */}
                <div className="text-right shrink-0">
                  <p className="text-white font-bold">₹{payment.amount}</p>
                  <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 glass rounded-lg text-sm disabled:opacity-30 hover:bg-white/10"
          >Previous</button>
          <span className="px-4 py-2 text-sm text-gray-400">Page {page} of {pagination.pages}</span>
          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 glass rounded-lg text-sm disabled:opacity-30 hover:bg-white/10"
          >Next</button>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
