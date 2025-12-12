import { useState } from 'react';
import { updateRentPayment, uploadPaymentProof } from '../services/api';
import { X, CreditCard, Banknote, Smartphone, FileText, Calendar, Upload, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

const PaymentModal = ({ payment, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    paymentMethod: 'upi',
    transactionId: '',
    notes: '',
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const paymentMethods = [
    { value: 'upi', label: 'UPI', icon: Smartphone },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: Banknote },
    { value: 'cash', label: 'Cash', icon: Banknote },
    { value: 'cheque', label: 'Cheque', icon: FileText },
    { value: 'online', label: 'Online Payment', icon: CreditCard },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload an image (JPEG, PNG, WEBP) or PDF file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setReceiptFile(file);
    setError('');

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First, upload the receipt if provided
      if (receiptFile) {
        const receiptFormData = new FormData();
        receiptFormData.append('paymentProof', receiptFile);
        await uploadPaymentProof(payment._id, receiptFormData);
      }

      // Then update payment details
      await updateRentPayment(payment._id, {
        status: receiptFile ? 'pending' : 'paid', // If receipt uploaded, wait for verification
        paymentDate: new Date().toISOString(),
        ...formData,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] flex flex-col relative animate-slide-up shadow-2xl">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Make Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Payment Details - Compact */}
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Amount</span>
              <span className="text-2xl font-bold text-primary-600">
                ₹{payment.amount?.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center text-xs text-gray-600 mb-1">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Due: {format(new Date(payment.dueDate), 'MMM dd, yyyy')}</span>
            </div>
            <div className="text-xs text-gray-700 truncate">
              <span className="font-semibold">Property:</span> {payment.property?.title}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: method.value })}
                      className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center ${
                        formData.paymentMethod === method.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`h-5 w-5 mb-1 ${
                        formData.paymentMethod === method.value ? 'text-primary-600' : 'text-gray-400'
                      }`} />
                      <span className={`text-xs font-medium text-center ${
                        formData.paymentMethod === method.value ? 'text-primary-600' : 'text-gray-600'
                      }`}>
                        {method.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction ID / Reference Number
              </label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                required
                placeholder="Enter transaction ID"
                className="input-field text-sm"
              />
            </div>

            {/* Receipt Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Payment Receipt (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  id="receipt-upload"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="receipt-upload" className="cursor-pointer">
                  {receiptPreview ? (
                    <div className="space-y-2">
                      <img src={receiptPreview} alt="Receipt preview" className="max-h-32 mx-auto rounded" />
                      <p className="text-xs text-gray-600">{receiptFile?.name}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setReceiptFile(null);
                          setReceiptPreview(null);
                        }}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : receiptFile ? (
                    <div className="space-y-2">
                      <FileText className="h-12 w-12 mx-auto text-gray-400" />
                      <p className="text-xs text-gray-600">{receiptFile.name}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setReceiptFile(null);
                        }}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-600">Click to upload receipt</p>
                      <p className="text-xs text-gray-500">Image or PDF (Max 10MB)</p>
                    </div>
                  )}
                </label>
              </div>
              {receiptFile && (
                <p className="text-xs text-blue-600 mt-2">
                  ℹ️ Receipt will be sent to owner for verification
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                maxLength="500"
                placeholder="Add any additional notes..."
                className="input-field text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.notes.length}/500</p>
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
