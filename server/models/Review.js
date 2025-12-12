import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property is required'],
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tenant is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title must be at most 100 characters'],
      trim: true,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      minlength: [20, 'Comment must be at least 20 characters'],
      maxlength: [1000, 'Comment must be at most 1000 characters'],
      trim: true,
    },
    pros: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          return v.length <= 5;
        },
        message: 'Maximum 5 pros allowed'
      }
    },
    cons: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          return v.length <= 5;
        },
        message: 'Maximum 5 cons allowed'
      }
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          return v.length <= 5;
        },
        message: 'Maximum 5 images allowed'
      }
    },
    verified: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    response: {
      text: {
        type: String,
        maxlength: [500, 'Response must be at most 500 characters'],
      },
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      respondedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
reviewSchema.index({ property: 1, tenant: 1 }, { unique: true }); // One review per tenant per property
reviewSchema.index({ property: 1, createdAt: -1 }); // For sorting
reviewSchema.index({ rating: 1 }); // For filtering

// Update helpful count before saving
reviewSchema.pre('save', function(next) {
  this.helpfulCount = this.helpful.length;
  next();
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
