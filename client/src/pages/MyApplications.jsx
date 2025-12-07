import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyApplications } from '../services/api';
import { Clock, CheckCircle, XCircle, Calendar, Home } from 'lucide-react';
import { format } from 'date-fns';

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await getMyApplications();
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Applications</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="card p-12 text-center">
            <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">You haven't applied for any properties yet</p>
            <button onClick={() => navigate('/properties')} className="btn-primary">
              Browse Properties
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((application) => (
              <div key={application._id} className="card p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Property Image */}
                  <div className="md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={application.property?.images?.[0] || 'https://via.placeholder.com/300x200'}
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
                        <p className="text-gray-600 text-sm">
                          {application.property?.address?.city}, {application.property?.address?.state}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-2 capitalize">{application.status}</span>
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
                        <span className="font-semibold">Your Message:</span> {application.message}
                      </p>
                    </div>

                    {application.status === 'rejected' && application.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                        <p className="text-sm text-red-700">
                          <span className="font-semibold">Rejection Reason:</span> {application.rejectionReason}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => navigate(`/properties/${application.property._id}`)}
                        className="btn-outline text-sm"
                      >
                        View Property
                      </button>
                      {application.status === 'approved' && (
                        <button
                          onClick={() => navigate(`/chat/${application.owner._id}`)}
                          className="btn-primary text-sm"
                        >
                          Contact Owner
                        </button>
                      )}
                    </div>
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

export default MyApplications;
