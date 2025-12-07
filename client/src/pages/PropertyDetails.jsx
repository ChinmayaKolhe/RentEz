import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProperty } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import MapView from '../components/MapView';
import ApplyPropertyModal from '../components/ApplyPropertyModal';
import { Bed, Bath, MapPin, IndianRupee, Home, MessageSquare, ArrowLeft, Calendar, FileText } from 'lucide-react';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await getProperty(id);
      setProperty(response.data);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactOwner = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/chat/${property.owner._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Property not found</p>
      </div>
    );
  }

  const images = property.images?.length > 0 
    ? property.images.map(img => img.startsWith('http') ? img : `${API_BASE}${img}`)
    : ['https://via.placeholder.com/800x600?text=No+Image'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/properties')}
          className="flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Properties
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="card overflow-hidden">
              <div className="relative h-96">
                <img
                  src={images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === currentImageIndex ? 'bg-white w-8' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-4">
                  {images.slice(0, 4).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${property.title} ${index + 1}`}
                      onClick={() => setCurrentImageIndex(index)}
                      className="h-20 w-full object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>
                      {property.address?.street}, {property.address?.city}, {property.address?.state} - {property.address?.zipCode}
                    </span>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  property.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {property.status}
                </span>
              </div>

              <div className="flex items-center space-x-6 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center">
                  <Bed className="h-6 w-6 text-primary-600 mr-2" />
                  <span className="text-lg font-semibold">{property.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-6 w-6 text-primary-600 mr-2" />
                  <span className="text-lg font-semibold">{property.bathrooms} Bathrooms</span>
                </div>
                <div className="flex items-center">
                  <Home className="h-6 w-6 text-primary-600 mr-2" />
                  <span className="text-lg font-semibold">{property.area} sq.ft</span>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">Description</h2>
                <p className="text-gray-600 leading-relaxed">{property.description}</p>
              </div>

              {property.amenities?.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-3">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, index) => (
                      <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Map */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Location</h2>
              <MapView
                longitude={property.location?.coordinates[0] || 0}
                latitude={property.location?.coordinates[1] || 0}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <IndianRupee className="h-8 w-8 text-primary-600" />
                  <span className="text-4xl font-bold text-primary-600">
                    ₹{property.rent?.toLocaleString()}
                  </span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                <p className="text-sm text-gray-500 capitalize">{property.propertyType}</p>
              </div>

              {property.availableFrom && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>Available from {new Date(property.availableFrom).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              {/* Owner Info */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-lg font-bold mb-3">Property Owner</h3>
                <div className="flex items-center space-x-3">
                  {property.owner?.profilePicture ? (
                    <img
                      src={property.owner.profilePicture.startsWith('http') ? property.owner.profilePicture : `${API_BASE}${property.owner.profilePicture}`}
                      alt={property.owner.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-bold text-lg">{property.owner?.name?.[0]}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{property.owner?.name}</p>
                    <p className="text-sm text-gray-500">{property.owner?.email}</p>
                  </div>
                </div>
              </div>

              {/* Contact Button */}
              {user && user._id !== property.owner?._id && user.role === 'tenant' && (
                <div className="space-y-3">
                  {property.status === 'available' && (
                    <button 
                      onClick={() => setShowApplyModal(true)} 
                      className="w-full btn-primary flex items-center justify-center"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      Apply for Property
                    </button>
                  )}
                  <button onClick={handleContactOwner} className="w-full btn-outline flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Contact Owner
                  </button>
                </div>
              )}

              {!user && (
                <button onClick={() => navigate('/login')} className="w-full btn-primary">
                  Login to Apply
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Apply Modal */}
        {showApplyModal && (
          <ApplyPropertyModal
            property={property}
            onClose={() => setShowApplyModal(false)}
            onSuccess={() => {
              alert('Application submitted successfully!');
              fetchProperty();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PropertyDetails;
