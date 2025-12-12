import RentPayment from '../models/RentPayment.js';
import Property from '../models/Property.js';

// @desc    Get tenant's rent payments
// @route   GET /api/rent/tenant
// @access  Private (Tenant only)
export const getTenantPayments = async (req, res) => {
  try {
    const payments = await RentPayment.find({ tenant: req.user._id })
      .populate('property', 'title address images')
      .populate('owner', 'name email phone')
      .sort({ dueDate: -1 });

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get owner's rent payments
// @route   GET /api/rent/owner
// @access  Private (Owner only)
export const getOwnerPayments = async (req, res) => {
  try {
    const payments = await RentPayment.find({ owner: req.user._id })
      .populate('property', 'title address images')
      .populate('tenant', 'name email phone')
      .sort({ dueDate: -1 });

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create rent payment
// @route   POST /api/rent
// @access  Private (Owner only)
export const createRentPayment = async (req, res) => {
  try {
    const { propertyId, tenantId, amount, dueDate } = req.body;

    // Verify property ownership
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create rent payment for this property',
      });
    }

    const payment = await RentPayment.create({
      property: propertyId,
      tenant: tenantId,
      owner: req.user._id,
      amount,
      dueDate,
    });

    await payment.populate('property tenant');

    res.status(201).json({
      success: true,
      message: 'Rent payment created successfully',
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update rent payment status
// @route   PUT /api/rent/:id
// @access  Private (Owner or Tenant)
export const updateRentPayment = async (req, res) => {
  try {
    const payment = await RentPayment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Check authorization (owner or tenant)
    const isOwner = payment.owner.toString() === req.user._id.toString();
    const isTenant = payment.tenant.toString() === req.user._id.toString();

    if (!isOwner && !isTenant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this payment',
      });
    }

    const { status, paymentDate, paymentMethod, transactionId, notes } = req.body;

    if (status) payment.status = status;
    if (paymentDate) payment.paymentDate = paymentDate;
    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (transactionId) payment.transactionId = transactionId;
    if (notes) payment.notes = notes;

    await payment.save();
    await payment.populate('property tenant owner');

    res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Upload payment proof
// @route   POST /api/rent/:id/upload-proof
// @access  Private (Tenant only)
export const uploadPaymentProof = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file',
      });
    }

    const payment = await RentPayment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Check authorization (tenant only)
    if (payment.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload proof for this payment',
      });
    }

    payment.paymentProof = `/uploads/${req.file.filename}`;
    payment.receiptUrl = `/uploads/${req.file.filename}`;
    payment.verificationStatus = 'pending_verification';
    await payment.save();

    await payment.populate('property tenant owner');

    res.status(200).json({
      success: true,
      message: 'Payment receipt uploaded successfully. Awaiting owner verification.',
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verify payment receipt
// @route   PUT /api/rent/:id/verify-receipt
// @access  Private (Owner only)
export const verifyPaymentReceipt = async (req, res) => {
  try {
    const payment = await RentPayment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Check authorization (owner only)
    if (payment.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify this payment',
      });
    }

    const { action, notes } = req.body; // action: 'approve' or 'reject'

    if (action === 'approve') {
      payment.verificationStatus = 'verified';
      payment.status = 'paid';
      payment.paymentDate = payment.paymentDate || new Date();
    } else if (action === 'reject') {
      payment.verificationStatus = 'rejected';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "approve" or "reject"',
      });
    }

    payment.verificationNotes = notes || '';
    payment.verifiedBy = req.user._id;
    payment.verifiedAt = new Date();

    await payment.save();
    await payment.populate('property tenant owner verifiedBy');

    res.status(200).json({
      success: true,
      message: `Payment receipt ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get payment statistics
// @route   GET /api/rent/stats
// @access  Private
export const getPaymentStats = async (req, res) => {
  try {
    const query = req.user.role === 'owner' 
      ? { owner: req.user._id } 
      : { tenant: req.user._id };

    const stats = await RentPayment.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
