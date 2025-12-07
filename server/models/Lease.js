import mongoose from 'mongoose';

const leaseSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    monthlyRent: {
      type: Number,
      required: true,
      min: 0,
    },
    securityDeposit: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'terminated'],
      default: 'active',
    },
    terms: {
      type: String,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
leaseSchema.index({ property: 1, status: 1 });
leaseSchema.index({ tenant: 1, status: 1 });
leaseSchema.index({ owner: 1, status: 1 });

const Lease = mongoose.model('Lease', leaseSchema);

export default Lease;
