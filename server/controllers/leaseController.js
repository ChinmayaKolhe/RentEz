import Lease from '../models/Lease.js';
import Application from '../models/Application.js';
import Property from '../models/Property.js';
import RentPayment from '../models/RentPayment.js';

// @desc    Create lease agreement
// @route   POST /api/leases
// @access  Private (Owner)
export const createLease = async (req, res) => {
  try {
    const { applicationId, securityDeposit, terms } = req.body;

    // Find and verify application
    const application = await Application.findOne({
      _id: applicationId,
      owner: req.user._id,
      status: 'approved',
    }).populate('property tenant');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Approved application not found',
      });
    }

    // Check if lease already exists
    const existingLease = await Lease.findOne({
      application: applicationId,
      status: 'active',
    });

    if (existingLease) {
      return res.status(400).json({
        success: false,
        message: 'Lease already exists for this application',
      });
    }

    // Calculate end date
    const startDate = new Date(application.moveInDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + application.leaseDuration);

    // Create lease
    const lease = await Lease.create({
      property: application.property._id,
      tenant: application.tenant._id,
      owner: req.user._id,
      application: applicationId,
      startDate,
      endDate,
      monthlyRent: application.property.rent,
      securityDeposit,
      terms,
    });

    // Update property status
    await Property.findByIdAndUpdate(application.property._id, {
      status: 'rented',
      currentTenant: application.tenant._id,
    });

    // Generate rent payments
    await generateRentPayments(lease);

    await lease.populate('property tenant owner application');

    res.status(201).json({
      success: true,
      message: 'Lease created successfully',
      data: lease,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function to generate rent payments
const generateRentPayments = async (lease) => {
  const payments = [];
  const startDate = new Date(lease.startDate);
  const endDate = new Date(lease.endDate);

  let currentDate = new Date(startDate);
  let monthNumber = 1;

  while (currentDate < endDate) {
    const dueDate = new Date(currentDate);
    dueDate.setMonth(dueDate.getMonth() + 1);

    payments.push({
      property: lease.property,
      tenant: lease.tenant,
      owner: lease.owner,
      lease: lease._id,
      amount: lease.monthlyRent,
      dueDate,
      monthNumber,
      status: 'pending',
    });

    currentDate = new Date(dueDate);
    monthNumber++;
  }

  await RentPayment.insertMany(payments);
};

// @desc    Get active leases
// @route   GET /api/leases/active
// @access  Private
export const getActiveLeases = async (req, res) => {
  try {
    const filter = { status: 'active' };

    if (req.user.role === 'owner') {
      filter.owner = req.user._id;
    } else {
      filter.tenant = req.user._id;
    }

    const leases = await Lease.find(filter)
      .populate('property tenant owner')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: leases.length,
      data: leases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get lease details
// @route   GET /api/leases/:id
// @access  Private
export const getLeaseDetails = async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.id)
      .populate('property tenant owner application');

    if (!lease) {
      return res.status(404).json({
        success: false,
        message: 'Lease not found',
      });
    }

    // Verify user has access
    if (
      lease.owner.toString() !== req.user._id.toString() &&
      lease.tenant.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    res.status(200).json({
      success: true,
      data: lease,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Terminate lease
// @route   PUT /api/leases/:id/terminate
// @access  Private (Owner)
export const terminateLease = async (req, res) => {
  try {
    const lease = await Lease.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!lease) {
      return res.status(404).json({
        success: false,
        message: 'Lease not found or unauthorized',
      });
    }

    lease.status = 'terminated';
    await lease.save();

    // Update property status
    await Property.findByIdAndUpdate(lease.property, {
      status: 'available',
      currentTenant: null,
    });

    // Cancel pending rent payments
    await RentPayment.updateMany(
      {
        lease: lease._id,
        status: 'pending',
      },
      {
        status: 'cancelled',
      }
    );

    res.status(200).json({
      success: true,
      message: 'Lease terminated successfully',
      data: lease,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
