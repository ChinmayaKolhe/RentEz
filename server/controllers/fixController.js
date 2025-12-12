import Property from '../models/Property.js';

// @desc    Fix location format for all properties
// @route   POST /api/properties/fix-locations
// @access  Private (Admin/Owner)
export const fixPropertyLocations = async (req, res) => {
  try {
    // Find all properties with coordinates but missing type
    const properties = await Property.find({
      'location.coordinates': { $exists: true }
    });

    let fixed = 0;
    for (const property of properties) {
      if (!property.location.type) {
        property.location.type = 'Point';
        await property.save();
        fixed++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Fixed ${fixed} properties`,
      data: {
        total: properties.length,
        fixed: fixed,
        alreadyCorrect: properties.length - fixed
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
