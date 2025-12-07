import mongoose from 'mongoose';

const rentPaymentSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'upi', 'card', 'other'],
      default: 'other',
    },
    transactionId: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Update status to overdue if payment is past due date
rentPaymentSchema.pre('save', function (next) {
  if (this.status === 'pending' && this.dueDate < new Date()) {
    this.status = 'overdue';
  }
  next();
});

// Index for efficient queries
rentPaymentSchema.index({ tenant: 1, status: 1 });
rentPaymentSchema.index({ owner: 1, status: 1 });
rentPaymentSchema.index({ property: 1, dueDate: 1 });

const RentPayment = mongoose.model('RentPayment', rentPaymentSchema);

export default RentPayment;
