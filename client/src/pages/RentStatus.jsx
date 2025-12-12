import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getTenantPayments, getOwnerPayments } from '../services/api';
import { IndianRupee, TrendingUp, Clock, CheckCircle, Receipt, CreditCard, Eye, CheckSquare } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import PaymentReceiptModal from '../components/PaymentReceiptModal';
import ReceiptViewModal from '../components/ReceiptViewModal';

const RentStatus = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ pending: 0, paid: 0, overdue: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showReceiptViewModal, setShowReceiptViewModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = user.role === 'owner' ? await getOwnerPayments() : await getTenantPayments();
      const paymentsData = response.data;
      setPayments(paymentsData);

      // Calculate stats
      const pending = paymentsData.filter((p) => p.status === 'pending').length;
      const paid = paymentsData.filter((p) => p.status === 'paid').length;
      const overdue = paymentsData.filter((p) => p.status === 'overdue').length;
      const total = paymentsData.reduce((sum, p) => sum + p.amount, 0);

      setStats({ pending, paid, overdue, total });
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
  };

  const handleViewReceiptImage = (payment) => {
    setSelectedPayment(payment);
    setShowReceiptViewModal(true);
  };

  const handlePaymentSuccess = () => {
    fetchPayments();
  };

  const getVerificationBadge = (payment) => {
    if (!payment.verificationStatus || payment.verificationStatus === 'not_submitted') {
      return null;
    }

    const badges = {
      pending_verification: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Verification' },
      verified: { color: 'bg-green-100 text-green-800', text: 'Verified' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
    };

    const badge = badges[payment.verificationStatus];
    if (!badge) return null;

    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Rent Payment Status</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600">Total Amount</h3>
              <TrendingUp className="h-6 w-6 text-primary-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">₹{stats.total.toLocaleString()}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600">Paid</h3>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.paid}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600">Pending</h3>
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600">Overdue</h3>
              <IndianRupee className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
          </div>
        </div>

        {/* Payments Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {user.role === 'owner' ? 'Tenant' : 'Owner'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="spinner mx-auto"></div>
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No payment records found
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{payment.property?.title}</div>
                        <div className="text-sm text-gray-500">{payment.property?.address?.city}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {user.role === 'owner' ? payment.tenant?.name : payment.owner?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.role === 'owner' ? payment.tenant?.email : payment.owner?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ₹{payment.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(payment.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : payment.status === 'overdue'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getVerificationBadge(payment)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          {user.role === 'tenant' && payment.status !== 'paid' && payment.status !== 'cancelled' && (
                            <button
                              onClick={() => handlePayNow(payment)}
                              className="btn-primary text-xs py-1 px-3 flex items-center"
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              Pay Now
                            </button>
                          )}
                          {payment.status === 'paid' && (
                            <button
                              onClick={() => handleViewReceipt(payment)}
                              className="btn-outline text-xs py-1 px-3 flex items-center"
                            >
                              <Receipt className="h-3 w-3 mr-1" />
                              Receipt
                            </button>
                          )}
                          {payment.receiptUrl && (
                            <button
                              onClick={() => handleViewReceiptImage(payment)}
                              className="btn-outline text-xs py-1 px-3 flex items-center"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </button>
                          )}
                          {user.role === 'owner' && payment.verificationStatus === 'pending_verification' && (
                            <button
                              onClick={() => handleViewReceiptImage(payment)}
                              className="bg-blue-600 text-white hover:bg-blue-700 text-xs py-1 px-3 rounded flex items-center"
                            >
                              <CheckSquare className="h-3 w-3 mr-1" />
                              Verify
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && selectedPayment && (
          <PaymentModal
            payment={selectedPayment}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedPayment(null);
            }}
            onSuccess={handlePaymentSuccess}
          />
        )}

        {/* Receipt Modal */}
        {showReceiptModal && selectedPayment && (
          <PaymentReceiptModal
            payment={selectedPayment}
            onClose={() => {
              setShowReceiptModal(false);
              setSelectedPayment(null);
            }}
          />
        )}

        {/* Receipt View Modal */}
        {showReceiptViewModal && selectedPayment && (
          <ReceiptViewModal
            payment={selectedPayment}
            isOwner={user.role === 'owner'}
            onClose={() => {
              setShowReceiptViewModal(false);
              setSelectedPayment(null);
            }}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default RentStatus;
