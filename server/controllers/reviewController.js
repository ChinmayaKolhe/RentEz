import Review from '../models/Review.js';
import Property from '../models/Property.js';
import Lease from '../models/Lease.js';

// Helper function to check if tenant can review
const canReview = async (tenantId, propertyId) => {
  // Check if tenant has a lease for this property
  const lease = await Lease.findOne({
    tenant: tenantId,
    property: propertyId,
    status: { $in: ['active', 'completed'] },
    startDate: { $lte: new Date() }
  });

  if (!lease) {
    return { canReview: false, message: 'You must have rented this property to review it' };
  }

  // Check if already reviewed
  const existingReview = await Review.findOne({
    tenant: tenantId,
    property: propertyId
  });

  if (existingReview) {
    return { canReview: false, message: 'You have already reviewed this property' };
  }

  return { canReview: true };
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private (Tenant only)
export const createReview = async (req, res) => {
  try {
    const { property, rating, title, comment, pros, cons } = req.body;
    const tenantId = req.user._id;

    // Check if tenant can review
    const reviewCheck = await canReview(tenantId, property);
    if (!reviewCheck.canReview) {
      return res.status(403).json({
        success: false,
        message: reviewCheck.message
      });
    }

    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/${file.filename}`);
    }

    // Create review
    const review = await Review.create({
      property,
      tenant: tenantId,
      rating,
      title,
      comment,
      pros: pros || [],
      cons: cons || [],
      images,
      verified: true // Since we verified they rented it
    });

    // Populate tenant info
    await review.populate('tenant', 'name profilePicture');

    // Update property average rating
    await updatePropertyRating(property);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get reviews for a property
// @route   GET /api/reviews/property/:propertyId
// @access  Public
export const getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { sort = 'recent', rating, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { property: propertyId };
    if (rating) {
      query.rating = parseInt(rating);
    }

    // Build sort
    let sortOption = {};
    switch (sort) {
      case 'helpful':
        sortOption = { helpfulCount: -1, createdAt: -1 };
        break;
      case 'highest':
        sortOption = { rating: -1, createdAt: -1 };
        break;
      case 'lowest':
        sortOption = { rating: 1, createdAt: -1 };
        break;
      default: // recent
        sortOption = { createdAt: -1 };
    }

    // Execute query
    const reviews = await Review.find(query)
      .populate('tenant', 'name profilePicture')
      .populate('response.respondedBy', 'name')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Review.countDocuments(query);

    // Get rating statistics
    const stats = await Review.aggregate([
      { $match: { property: mongoose.Types.ObjectId(propertyId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          distribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    // Calculate rating distribution
    let ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (stats.length > 0) {
      stats[0].distribution.forEach(rating => {
        ratingDistribution[rating]++;
      });
    }

    res.status(200).json({
      success: true,
      data: {
        reviews,
        stats: stats.length > 0 ? {
          averageRating: stats[0].averageRating.toFixed(1),
          totalReviews: stats[0].totalReviews,
          distribution: ratingDistribution
        } : {
          averageRating: 0,
          totalReviews: 0,
          distribution: ratingDistribution
        },
        pagination: {
          total: count,
          page: Number(page),
          pages: Math.ceil(count / limit)
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

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Review author only)
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    const { rating, title, comment, pros, cons } = req.body;

    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;
    review.pros = pros || review.pros;
    review.cons = cons || review.cons;

    await review.save();

    // Update property rating
    await updatePropertyRating(review.property);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Review author only)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    const propertyId = review.property;
    await review.deleteOne();

    // Update property rating
    await updatePropertyRating(propertyId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
export const markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const userId = req.user._id;
    const index = review.helpful.indexOf(userId);

    if (index > -1) {
      // Remove from helpful
      review.helpful.splice(index, 1);
    } else {
      // Add to helpful
      review.helpful.push(userId);
    }

    await review.save();

    res.status(200).json({
      success: true,
      message: index > -1 ? 'Removed from helpful' : 'Marked as helpful',
      data: {
        helpfulCount: review.helpfulCount,
        isHelpful: index === -1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add owner response to review
// @route   POST /api/reviews/:id/response
// @access  Private (Owner only)
export const addOwnerResponse = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('property');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the property owner
    if (review.property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the property owner can respond to this review'
      });
    }

    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Response text is required'
      });
    }

    review.response = {
      text,
      respondedBy: req.user._id,
      respondedAt: new Date()
    };

    await review.save();
    await review.populate('response.respondedBy', 'name');

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get tenant's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private (Tenant only)
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ tenant: req.user._id })
      .populate('property', 'title images address')
      .populate('response.respondedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to update property average rating
const updatePropertyRating = async (propertyId) => {
  const stats = await Review.aggregate([
    { $match: { property: mongoose.Types.ObjectId(propertyId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  await Property.findByIdAndUpdate(propertyId, {
    averageRating: stats.length > 0 ? stats[0].averageRating : 0,
    totalReviews: stats.length > 0 ? stats[0].totalReviews : 0
  });
};
