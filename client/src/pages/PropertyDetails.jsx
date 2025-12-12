import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProperty, getPropertyReviews, createReview, markReviewHelpful, addOwnerResponse } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import MapView from '../components/MapView';
import ApplyPropertyModal from '../components/ApplyPropertyModal';
import ReviewStats from '../components/ReviewStats';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import StarRating from '../components/StarRating';
import { Bed, Bath, MapPin, IndianRupee, Home, MessageSquare, ArrowLeft, Calendar, FileText, Star, X } from 'lucide-react';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    fetchProperty();
    fetchReviews();
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

  const fetchReviews = async () => {
    try {
      const response = await getPropertyReviews(id);
      setReviews(response.data.reviews);
      setReviewStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async (formData) => {
    try {
      setReviewLoading(true);
      formData.append('property', id);
      await createReview(formData);
      alert('Review submitted successfully!');
      setShowReviewModal(false);
      fetchReviews();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      await markReviewHelpful(reviewId);
      fetchReviews();
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const handleResponse = (reviewId) => {
    setSelectedReviewId(reviewId);
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async () => {
    try {
      await addOwnerResponse(selectedReviewId, { text: responseText });
      alert('Response added successfully!');
      setShowResponseModal(false);
      setResponseText('');
      setSelectedReviewId(null);
      fetchReviews();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add response');
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

        {/* Reviews Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Reviews & Ratings</h2>
            {user?.role === 'tenant' && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Star className="h-5 w-5" />
                Write a Review
              </button>
            )}
          </div>

          {/* Review Stats */}
          <div className="mb-8">
            <ReviewStats stats={reviewStats} />
          </div>

          {/* Review List */}
          <ReviewList
            reviews={reviews}
            stats={reviewStats}
            onHelpful={handleHelpful}
            onResponse={handleResponse}
            isOwner={property?.owner?._id === user?._id}
            currentUserId={user?._id}
          />
        </div>

        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
                <ReviewForm
                  onSubmit={handleSubmitReview}
                  onCancel={() => setShowReviewModal(false)}
                  loading={reviewLoading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Owner Response Modal */}
        {showResponseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-lg w-full">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Respond to Review</h2>
                <button
                  onClick={() => {
                    setShowResponseModal(false);
                    setResponseText('');
                    setSelectedReviewId(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="input-field mb-4"
                  placeholder="Write your response..."
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">{responseText.length}/500</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowResponseModal(false);
                        setResponseText('');
                        setSelectedReviewId(null);
                      }}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitResponse}
                      className="btn-primary"
                      disabled={!responseText.trim()}
                    >
                      Submit Response
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
