import { useState, useEffect } from 'react';
import { getTenantPayments, uploadPaymentProof } from '../services/api';
import { DollarSign, Calendar, CheckCircle, XCircle, Clock, Upload, User as UserIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const TenantDashboard = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const profilePicUrl = user?.profilePicture?.startsWith('http') 
    ? user.profilePicture 
    : user?.profilePicture 
    ? `${API_BASE}${user.profilePicture}` 
    : null;

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await getTenantPayments();
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (paymentId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('paymentProof', file);

      await uploadPaymentProof(paymentId, formData);
      
      // Refresh payments to show updated status/proof
      await fetchPayments();
      alert('Payment proof uploaded successfully!');
    } catch (error) {
      console.error('Error uploading proof:', error);
      alert('Failed to upload payment proof');
    } finally {
      setUploading(false);
    }
  };

  const statusColors = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'overdue':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Section */}
        <div className="card p-6 mb-8 bg-gradient-to-r from-primary-50 to-secondary-50">
          <div className="flex items-center gap-4">
            {profilePicUrl ? (
              <img 
                src={profilePicUrl} 
                alt={user?.name} 
                className="h-16 w-16 rounded-full object-cover border-4 border-white shadow-lg" 
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h2>
              <p className="text-gray-600">Track your rent payments and property details</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Rent Payments</h1>
          <p className="text-gray-600">View and manage your rent payment history</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-500 text-lg">No rent payments found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {payments.map((payment) => (
              <div key={payment._id} className="card p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1 mb-4 md:mb-0">
                    <div className="flex items-center mb-2">
                      <div className="h-16 w-16 rounded-lg bg-gray-200 mr-4 overflow-hidden flex-shrink-0">
                        {payment.property?.images?.[0] ? (
                          <img
                            src={payment.property.images[0]}
                            alt={payment.property.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/100x100?text=Property'; 
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                             <span className="text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{payment.property?.title}</h3>
                        <p className="text-gray-600 text-sm">
                          {payment.property?.address?.city}, {payment.property?.address?.state}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="text-center md:text-right">
                      <div className="flex items-center justify-center md:justify-end mb-1">
                        
                        <span className="text-2xl font-bold text-primary-600">
                          ₹{payment.amount?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        Due: {new Date(payment.dueDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                       <div className="flex items-center justify-center">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-2 capitalize">{payment.status}</span>
                        </span>
                      </div>

                      {/* Upload Receipt Button */}
                      {(payment.status === 'pending' || payment.status === 'overdue') && (
                        <div className="relative">
                           <input
                            type="file"
                            accept="image/*"
                            id={`upload-${payment._id}`}
                            className="hidden"
                            onChange={(e) => handleFileUpload(payment._id, e)}
                            disabled={uploading}
                          />
                          <label
                            htmlFor={`upload-${payment._id}`}
                            className={`cursor-pointer inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {uploading ? 'Uploading...' : 'Upload Receipt'}
                          </label>
                        </div>
                      )}
                      
                      {/* View Receipt Link if exists */}
                      {payment.paymentProof && (
                         <a 
                           href={payment.paymentProof} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                         >
                           View Uploaded Receipt
                         </a>
                      )}
                    </div>

                  </div>
                </div>

                {payment.paymentDate && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Paid on: {new Date(payment.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantDashboard;
