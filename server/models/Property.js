import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Property description is required'],
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    rent: {
      type: Number,
      required: [true, 'Rent amount is required'],
      min: [0, 'Rent cannot be negative'],
    },
    bedrooms: {
      type: Number,
      required: true,
      min: [0, 'Bedrooms cannot be negative'],
    },
    bathrooms: {
      type: Number,
      required: true,
      min: [0, 'Bathrooms cannot be negative'],
    },
    area: {
      type: Number, // in square feet
      required: true,
    },
    propertyType: {
      type: String,
      enum: ['apartment', 'house', 'villa', 'studio', 'commercial'],
      default: 'apartment',
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    availableFrom: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['available', 'rented', 'maintenance'],
      default: 'available',
    },
    currentTenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to ensure proper GeoJSON format
propertySchema.pre('save', function(next) {
  if (this.location && this.location.coordinates && !this.location.type) {
    this.location.type = 'Point';
  }
  next();
});

// Pre-update middleware to ensure proper GeoJSON format
propertySchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.location && update.location.coordinates && !update.location.type) {
    update.location.type = 'Point';
  }
  next();
});

// Create geospatial index for location-based queries
propertySchema.index({ location: '2dsphere' });

// Index for search optimization
propertySchema.index({ title: 'text', description: 'text' });

const Property = mongoose.model('Property', propertySchema);

export default Property;
