import Application from '../models/Application.js';
import Property from '../models/Property.js';

// @desc    Apply for a property
// @route   POST /api/applications
// @access  Private (Tenant)
export const applyForProperty = async (req, res) => {
  try {
    const { propertyId, message, moveInDate, leaseDuration } = req.body;

    // Check if property exists
    const property = await Property.findById(propertyId).populate('owner');
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Check if property is available
    if (property.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Property is not available for rent',
      });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      property: propertyId,
      tenant: req.user._id,
      status: { $in: ['pending', 'approved'] },
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this property',
      });
    }

    // Create application
    const application = await Application.create({
      property: propertyId,
      tenant: req.user._id,
      owner: property.owner._id,
      message,
      moveInDate,
      leaseDuration,
    });

    await application.populate('property tenant owner');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get tenant's applications
// @route   GET /api/applications/my-applications
// @access  Private (Tenant)
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ tenant: req.user._id })
      .populate('property owner')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get applications for owner's properties
// @route   GET /api/applications/received
// @access  Private (Owner)
export const getReceivedApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { owner: req.user._id };

    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate('property tenant')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get applications for a specific property
// @route   GET /api/applications/property/:propertyId
// @access  Private (Owner)
export const getPropertyApplications = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Verify property belongs to owner
    const property = await Property.findOne({
      _id: propertyId,
      owner: req.user._id,
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found or unauthorized',
      });
    }

    const applications = await Application.find({ property: propertyId })
      .populate('tenant')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update application status (approve/reject)
// @route   PUT /api/applications/:id/status
// @access  Private (Owner)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const application = await Application.findOne({
      _id: id,
      owner: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized',
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Application has already been processed',
      });
    }

    application.status = status;
    if (status === 'rejected' && rejectionReason) {
      application.rejectionReason = rejectionReason;
    }

    await application.save();
    await application.populate('property tenant owner');

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get application statistics
// @route   GET /api/applications/stats
// @access  Private
export const getApplicationStats = async (req, res) => {
  try {
    const filter = req.user.role === 'owner' 
      ? { owner: req.user._id }
      : { tenant: req.user._id };

    const stats = await Application.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    stats.forEach((stat) => {
      result[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
