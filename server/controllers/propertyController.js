import Property from '../models/Property.js';

// @desc    Get all properties with filters
// @route   GET /api/properties
// @access  Public
export const getProperties = async (req, res) => {
  try {
    const {
      search,
      city,
      minRent,
      maxRent,
      bedrooms,
      propertyType,
      status,
      page = 1,
      limit = 12,
    } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    if (minRent || maxRent) {
      query.rent = {};
      if (minRent) query.rent.$gte = Number(minRent);
      if (maxRent) query.rent.$lte = Number(maxRent);
    }

    if (bedrooms) {
      query.bedrooms = Number(bedrooms);
    }

    if (propertyType) {
      query.propertyType = propertyType;
    }

    if (status) {
      query.status = status;
    } else {
      query.status = 'available'; // Default to available properties
    }

    // Execute query with pagination
    const properties = await Property.find(query)
      .populate('owner', 'name email phone profilePicture')
      .populate('currentTenant', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Property.countDocuments(query);

    res.status(200).json({
      success: true,
      data: properties,
      pagination: {
        total: count,
        page: Number(page),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
export const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email phone profilePicture')
      .populate('currentTenant', 'name email');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Owner only)
export const createProperty = async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      owner: req.user._id,
    };

    // Handle multiple image uploads - save local file paths
    if (req.files && req.files.length > 0) {
      const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
      propertyData.images = imageUrls;
    }

    const property = await Property.create(propertyData);

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Owner only)
export const updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Check ownership
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property',
      });
    }

    // Handle new image uploads - save local file paths
    if (req.files && req.files.length > 0) {
      const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
      req.body.images = [...(property.images || []), ...imageUrls];
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Owner only)
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Check ownership
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property',
      });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get owner's properties
// @route   GET /api/properties/owner/my-properties
// @access  Private (Owner only)
export const getOwnerProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id })
      .populate('currentTenant', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
