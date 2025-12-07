import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProperty, updateProperty, getProperty } from '../services/api';
import { ArrowLeft, Upload, X } from 'lucide-react';

const AddProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    longitude: '',
    latitude: '',
    rent: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    propertyType: 'apartment',
    amenities: '',
    availableFrom: '',
  });

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await getProperty(id);
      const property = response.data;
      setFormData({
        title: property.title,
        description: property.description,
        street: property.address.street,
        city: property.address.city,
        state: property.address.state,
        zipCode: property.address.zipCode,
        country: property.address.country,
        longitude: property.location.coordinates[0],
        latitude: property.location.coordinates[1],
        rent: property.rent,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        propertyType: property.propertyType,
        amenities: property.amenities.join(', '),
        availableFrom: property.availableFrom?.split('T')[0] || '',
      });
    } catch (error) {
      console.error('Error fetching property:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('address[street]', formData.street);
      data.append('address[city]', formData.city);
      data.append('address[state]', formData.state);
      data.append('address[zipCode]', formData.zipCode);
      data.append('address[country]', formData.country);
      data.append('location[coordinates][0]', formData.longitude);
      data.append('location[coordinates][1]', formData.latitude);
      data.append('rent', formData.rent);
      data.append('bedrooms', formData.bedrooms);
      data.append('bathrooms', formData.bathrooms);
      data.append('area', formData.area);
      data.append('propertyType', formData.propertyType);
      data.append('availableFrom', formData.availableFrom);

      // Add amenities as array
      const amenitiesArray = formData.amenities.split(',').map((a) => a.trim()).filter((a) => a);
      amenitiesArray.forEach((amenity) => {
        data.append('amenities[]', amenity);
      });

      // Add images
      images.forEach((image) => {
        data.append('images', image);
      });

      if (id) {
        await updateProperty(id, data);
      } else {
        await createProperty(data);
      }

      navigate('/owner/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/owner/dashboard')}
          className="flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="card p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {id ? 'Edit Property' : 'Add New Property'}
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <h2 className="text-xl font-bold mb-4">Basic Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Beautiful 2BHK Apartment"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="input-field"
                    placeholder="Describe your property..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                  <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="input-field">
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="studio">Studio</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available From</label>
                  <input
                    type="date"
                    name="availableFrom"
                    value={formData.availableFrom}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h2 className="text-xl font-bold mb-4">Address</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Location Coordinates */}
            <div>
              <h2 className="text-xl font-bold mb-4">Location Coordinates</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="72.8777"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="19.0760"
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div>
              <h2 className="text-xl font-bold mb-4">Property Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    name="rent"
                    value={formData.rent}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="25000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area (sq.ft)</label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="1200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenities (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="amenities"
                    value={formData.amenities}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Parking, Gym, Swimming Pool, Security"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div>
              <h2 className="text-xl font-bold mb-4">Property Images</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Click to upload images</p>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF up to 5MB</p>
                </label>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : id ? 'Update Property' : 'Add Property'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/owner/dashboard')}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;
