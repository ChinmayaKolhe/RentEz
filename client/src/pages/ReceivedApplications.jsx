import { useState, useEffect } from 'react';
import { getReceivedApplications, updateApplicationStatus, createLease } from '../services/api';
import { Clock, CheckCircle, XCircle, Calendar, User, FileText } from 'lucide-react';
import { format } from 'date-fns';

const ReceivedApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const status = filter === 'all' ? undefined : filter;
      const response = await getReceivedApplications(status);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (application) => {
    if (!confirm('Are you sure you want to approve this application?')) return;

    try {
      setProcessingId(application._id);
      await updateApplicationStatus(application._id, { status: 'approved' });
      
      // Create lease automatically
      const securityDeposit = prompt('Enter security deposit amount:', application.property.rent * 2);
      if (securityDeposit) {
        await createLease({
          applicationId: application._id,
          securityDeposit: parseFloat(securityDeposit),
          terms: 'Standard lease agreement terms apply.',
        });
        alert('Application approved and lease created successfully!');
      }
      
      fetchApplications();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve application');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (applicationId) => {
    const rejectionReason = prompt('Enter rejection reason (optional):');
    if (rejectionReason === null) return;

    try {
      setProcessingId(applicationId);
      await updateApplicationStatus(applicationId, {
        status: 'rejected',
        rejectionReason,
      });
      alert('Application rejected');
      fetchApplications();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject application');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Received Applications</h1>
          
          {/* Filter Tabs */}
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="card p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No applications found</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((application) => (
              <div key={application._id} className="card p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Property Info */}
                  <div className="md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={
                        application.property?.images?.[0]
                          ? (application.property.images[0].startsWith('http')
                              ? application.property.images[0]
                              : `${API_BASE}${application.property.images[0]}`)
                          : 'https://via.placeholder.com/300x200?text=No+Image'
                      }
                      alt={application.property?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Application Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {application.property?.title}
                        </h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <User className="h-4 w-4 mr-2" />
                          <span className="text-sm font-semibold">{application.tenant?.name}</span>
                          <span className="text-sm ml-2">({application.tenant?.email})</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          Move-in: {format(new Date(application.moveInDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          Duration: {application.leaseDuration} months
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Tenant's Message:</span> {application.message}
                      </p>
                    </div>

                    {application.status === 'pending' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(application)}
                          disabled={processingId === application._id}
                          className="btn-primary flex items-center disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {processingId === application._id ? 'Processing...' : 'Approve & Create Lease'}
                        </button>
                        <button
                          onClick={() => handleReject(application._id)}
                          disabled={processingId === application._id}
                          className="btn-outline flex items-center text-red-600 border-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceivedApplications;
