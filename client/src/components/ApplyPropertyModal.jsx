import { useState } from 'react';
import { applyForProperty } from '../services/api';
import { X, Calendar, Clock } from 'lucide-react';

const ApplyPropertyModal = ({ property, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    message: '',
    moveInDate: '',
    leaseDuration: 12,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await applyForProperty(property._id, formData);
      onSuccess();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[85vh] flex flex-col relative animate-slide-up shadow-2xl">
        {/* Fixed Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900">Apply for Property</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{property.title}</span>
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                Preferred Move-in Date
              </label>
              <input
                type="date"
                name="moveInDate"
                value={formData.moveInDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="inline h-4 w-4 mr-1" />
                Lease Duration
              </label>
              <select
                name="leaseDuration"
                value={formData.leaseDuration}
                onChange={handleChange}
                required
                className="input-field text-sm"
              >
                <option value="3">3 months</option>
                <option value="6">6 months</option>
                <option value="11">11 months</option>
                <option value="12">12 months (1 year)</option>
                <option value="24">24 months (2 years)</option>
                <option value="36">36 months (3 years)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message to Owner
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="3"
                maxLength="500"
                placeholder="Tell the owner why you're a great tenant..."
                className="input-field text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.message.length}/500</p>
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
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyPropertyModal;
