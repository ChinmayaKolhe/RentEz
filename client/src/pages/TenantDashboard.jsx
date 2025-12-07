import { useState, useEffect } from 'react';
import { getTenantPayments } from '../services/api';
import { DollarSign, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

const TenantDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tenant Dashboard</h1>
          <p className="text-gray-600">Track your rent payments and property details</p>
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
                      {payment.property?.images?.[0] && (
                        <img
                          src={payment.property.images[0]}
                          alt={payment.property.title}
                          className="h-16 w-16 rounded-lg object-cover mr-4"
                        />
                      )}
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

                    <div className="flex items-center justify-center">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-2 capitalize">{payment.status}</span>
                      </span>
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
