import { useState, useEffect } from 'react';
import { getOwnerOverview, getRevenueBreakdown, getPropertyPerformance } from '../services/api';
import AnalyticsCard from '../components/AnalyticsCard';
import RevenueChart from '../components/RevenueChart';
import PaymentStatusChart from '../components/PaymentStatusChart';
import { DollarSign, Home, TrendingUp, Users, BarChart3, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [propertyPerformance, setPropertyPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState(6);

  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [overviewRes, revenueRes, performanceRes] = await Promise.all([
        getOwnerOverview(),
        getRevenueBreakdown(timeRange),
        getPropertyPerformance()
      ]);

      setOverview(overviewRes.data);
      setRevenueData(revenueRes.data);
      setPropertyPerformance(performanceRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your property performance and revenue</p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnalyticsCard
            title="Total Revenue"
            value={`₹${overview?.totalRevenue?.toLocaleString() || 0}`}
            subtitle={`${overview?.collectionRate || 0}% collected`}
            icon={DollarSign}
            color="green"
          />
          <AnalyticsCard
            title="Properties"
            value={overview?.totalProperties || 0}
            subtitle={`${overview?.activeLeases || 0} active leases`}
            icon={Home}
            color="primary"
          />
          <AnalyticsCard
            title="Occupancy Rate"
            value={`${overview?.occupancyRate || 0}%`}
            subtitle={`${overview?.activeLeases || 0} of ${overview?.totalProperties || 0} rented`}
            icon={TrendingUp}
            color="blue"
          />
          <AnalyticsCard
            title="Pending Payments"
            value={`₹${overview?.pendingAmount?.toLocaleString() || 0}`}
            subtitle={`${overview?.paymentCounts?.pending || 0} payments`}
            icon={Users}
            color="yellow"
          />
        </div>

        {/* Revenue Chart */}
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Revenue Trends</h2>
            <div className="flex gap-3">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={3}>Last 3 months</option>
                <option value={6}>Last 6 months</option>
                <option value={12}>Last 12 months</option>
              </select>

              {/* Chart Type Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setChartType('line')}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    chartType === 'line'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Line
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    chartType === 'bar'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Bar
                </button>
              </div>
            </div>
          </div>
          <RevenueChart data={revenueData} type={chartType} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Payment Status Chart */}
          <div className="card p-6 lg:col-span-1">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Distribution</h2>
            <PaymentStatusChart
              paid={overview?.paidAmount || 0}
              pending={overview?.pendingAmount || 0}
              overdue={overview?.overdueAmount || 0}
            />
          </div>

          {/* Quick Stats */}
          <div className="card p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{overview?.paidAmount?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {overview?.paymentCounts?.paid || 0} payments
                </p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  ₹{overview?.pendingAmount?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {overview?.paymentCounts?.pending || 0} payments
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  ₹{overview?.overdueAmount?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {overview?.paymentCounts?.overdue || 0} payments
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Property Performance Table */}
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Property Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collection Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Occupancy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {propertyPerformance.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No property data available
                    </td>
                  </tr>
                ) : (
                  propertyPerformance.map((property) => (
                    <tr key={property._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                            {property.image ? (
                              <img
                                src={property.image.startsWith('http') ? property.image : `${API_BASE}${property.image}`}
                                alt={property.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                <Home className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{property.title}</p>
                            <p className="text-xs text-gray-500">{property.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            property.status === 'rented'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {property.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ₹{property.totalRevenue?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${property.collectionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{property.collectionRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {property.occupancyDays > 0 ? `${property.occupancyDays} days` : 'Vacant'}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/properties/${property._id}`}
                          className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
