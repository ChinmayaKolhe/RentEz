import RentPayment from '../models/RentPayment.js';
import Property from '../models/Property.js';
import Lease from '../models/Lease.js';

// @desc    Get owner analytics overview
// @route   GET /api/analytics/owner/overview
// @access  Private (Owner only)
export const getOwnerOverview = async (req, res) => {
  try {
    const ownerId = req.user._id;

    // Get all owner's properties
    const properties = await Property.find({ owner: ownerId });
    const propertyIds = properties.map(p => p._id);

    // Total properties
    const totalProperties = properties.length;

    // Active leases
    const activeLeases = await Lease.countDocuments({
      property: { $in: propertyIds },
      status: 'active'
    });

    // Occupancy rate
    const occupancyRate = totalProperties > 0 
      ? ((activeLeases / totalProperties) * 100).toFixed(1)
      : 0;

    // Payment statistics
    const paymentStats = await RentPayment.aggregate([
      {
        $match: {
          property: { $in: propertyIds }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Calculate totals
    let totalRevenue = 0;
    let paidAmount = 0;
    let pendingAmount = 0;
    let overdueAmount = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

    paymentStats.forEach(stat => {
      totalRevenue += stat.totalAmount;
      if (stat._id === 'paid') {
        paidAmount = stat.totalAmount;
        paidCount = stat.count;
      } else if (stat._id === 'pending') {
        pendingAmount = stat.totalAmount;
        pendingCount = stat.count;
      } else if (stat._id === 'overdue') {
        overdueAmount = stat.totalAmount;
        overdueCount = stat.count;
      }
    });

    // Collection rate
    const collectionRate = totalRevenue > 0
      ? ((paidAmount / totalRevenue) * 100).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalProperties,
        activeLeases,
        occupancyRate: parseFloat(occupancyRate),
        totalRevenue,
        paidAmount,
        pendingAmount,
        overdueAmount,
        collectionRate: parseFloat(collectionRate),
        paymentCounts: {
          paid: paidCount,
          pending: pendingCount,
          overdue: overdueCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get revenue breakdown by month
// @route   GET /api/analytics/owner/revenue
// @access  Private (Owner only)
export const getRevenueBreakdown = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { months = 6 } = req.query; // Default to last 6 months

    // Get owner's properties
    const properties = await Property.find({ owner: ownerId });
    const propertyIds = properties.map(p => p._id);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    // Monthly revenue aggregation
    const monthlyRevenue = await RentPayment.aggregate([
      {
        $match: {
          property: { $in: propertyIds },
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$amount' },
          paid: {
            $sum: {
              $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0]
            }
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0]
            }
          },
          overdue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'overdue'] }, '$amount', 0]
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format the data
    const formattedData = monthlyRevenue.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      monthName: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      total: item.total,
      paid: item.paid,
      pending: item.pending,
      overdue: item.overdue,
      count: item.count
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get property performance metrics
// @route   GET /api/analytics/owner/properties
// @access  Private (Owner only)
export const getPropertyPerformance = async (req, res) => {
  try {
    const ownerId = req.user._id;

    // Get all properties with payment data
    const properties = await Property.find({ owner: ownerId })
      .select('title rent status images address');

    const performanceData = await Promise.all(
      properties.map(async (property) => {
        // Get payment statistics for this property
        const payments = await RentPayment.aggregate([
          {
            $match: { property: property._id }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              amount: { $sum: '$amount' }
            }
          }
        ]);

        let totalRevenue = 0;
        let paidRevenue = 0;
        let totalPayments = 0;
        let paidPayments = 0;

        payments.forEach(p => {
          totalRevenue += p.amount;
          totalPayments += p.count;
          if (p._id === 'paid') {
            paidRevenue = p.amount;
            paidPayments = p.count;
          }
        });

        // Get active lease info
        const activeLease = await Lease.findOne({
          property: property._id,
          status: 'active'
        }).populate('tenant', 'name email');

        // Calculate occupancy days (if rented)
        let occupancyDays = 0;
        if (activeLease) {
          const startDate = new Date(activeLease.startDate);
          const today = new Date();
          occupancyDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        }

        return {
          _id: property._id,
          title: property.title,
          rent: property.rent,
          status: property.status,
          image: property.images?.[0] || null,
          location: `${property.address?.city}, ${property.address?.state}`,
          totalRevenue,
          paidRevenue,
          collectionRate: totalRevenue > 0 ? ((paidRevenue / totalRevenue) * 100).toFixed(1) : 0,
          totalPayments,
          paidPayments,
          occupancyDays,
          currentTenant: activeLease?.tenant || null
        };
      })
    );

    // Sort by revenue (highest first)
    performanceData.sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.status(200).json({
      success: true,
      data: performanceData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
