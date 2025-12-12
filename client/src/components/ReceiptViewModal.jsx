import { useState } from 'react';
import { X, Check, XCircle, FileText, Image as ImageIcon, ZoomIn } from 'lucide-react';
import { verifyPaymentReceipt } from '../services/api';

const ReceiptViewModal = ({ payment, onClose, onSuccess, isOwner }) => {
  const [action, setAction] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFullImage, setShowFullImage] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const receiptUrl = payment.receiptUrl?.startsWith('http') 
    ? payment.receiptUrl 
    : `${API_BASE}${payment.receiptUrl}`;

  const isPDF = payment.receiptUrl?.toLowerCase().endsWith('.pdf');

  const handleVerify = async () => {
    if (!action) {
      setError('Please select an action (Approve or Reject)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyPaymentReceipt(payment._id, { action, notes });
      onSuccess();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to verify receipt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col relative animate-slide-up shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Payment Receipt</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Payment Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <p className="font-semibold text-lg">₹{payment.amount?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <p className="font-semibold capitalize">{payment.status}</p>
                </div>
                <div>
                  <span className="text-gray-600">Property:</span>
                  <p className="font-semibold">{payment.property?.title}</p>
                </div>
                <div>
                  <span className="text-gray-600">Tenant:</span>
                  <p className="font-semibold">{payment.tenant?.name}</p>
                </div>
              </div>
            </div>

            {/* Receipt Display */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Uploaded Receipt</h3>
                {!isPDF && (
                  <button
                    onClick={() => setShowFullImage(true)}
                    className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
                  >
                    <ZoomIn className="h-4 w-4 mr-1" />
                    View Full Size
                  </button>
                )}
              </div>
              
              {isPDF ? (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-4">PDF Receipt</p>
                  <a
                    href={receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Open PDF
                  </a>
                </div>
              ) : (
                <img
                  src={receiptUrl}
                  alt="Payment Receipt"
                  className="w-full rounded-lg border border-gray-200"
                />
              )}
            </div>

            {/* Verification Status */}
            {payment.verificationStatus && payment.verificationStatus !== 'not_submitted' && (
              <div className={`p-4 rounded-lg ${
                payment.verificationStatus === 'verified' ? 'bg-green-50 border border-green-200' :
                payment.verificationStatus === 'rejected' ? 'bg-red-50 border border-red-200' :
                'bg-yellow-50 border border-yellow-200'
              }`}>
                <p className="font-semibold mb-1">
                  Verification Status: <span className="capitalize">{payment.verificationStatus.replace('_', ' ')}</span>
                </p>
                {payment.verificationNotes && (
                  <p className="text-sm text-gray-700">Notes: {payment.verificationNotes}</p>
                )}
              </div>
            )}

            {/* Owner Verification Actions */}
            {isOwner && payment.verificationStatus === 'pending_verification' && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-gray-900">Verify Receipt</h3>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setAction('approve')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center ${
                      action === 'approve'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-green-300'
                    }`}
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => setAction('reject')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center ${
                      action === 'reject'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 hover:border-red-300'
                    }`}
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Reject
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="3"
                    placeholder="Add verification notes..."
                    className="input-field text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 btn-outline"
              >
                Close
              </button>
              {isOwner && payment.verificationStatus === 'pending_verification' && (
                <button
                  onClick={handleVerify}
                  disabled={loading || !action}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Submit Verification'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {showFullImage && !isPDF && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4"
          onClick={() => setShowFullImage(false)}
        >
          <button
            onClick={() => setShowFullImage(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={receiptUrl}
            alt="Payment Receipt Full Size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default ReceiptViewModal;
