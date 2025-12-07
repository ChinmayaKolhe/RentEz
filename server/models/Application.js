import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    moveInDate: {
      type: Date,
      required: true,
    },
    leaseDuration: {
      type: Number,
      required: true,
      min: 1,
      max: 60, // Max 5 years
    },
    rejectionReason: {
      type: String,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
applicationSchema.index({ property: 1, tenant: 1 });
applicationSchema.index({ owner: 1, status: 1 });
applicationSchema.index({ tenant: 1, status: 1 });

const Application = mongoose.model('Application', applicationSchema);

export default Application;
