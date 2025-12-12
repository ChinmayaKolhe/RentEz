import StarRating from './StarRating';
import { User, ThumbsUp, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

const ReviewCard = ({ review, onHelpful, onResponse, isOwner, currentUserId }) => {
  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  
  const isHelpful = review.helpful?.includes(currentUserId);

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {review.tenant?.profilePicture ? (
            <img
              src={review.tenant.profilePicture.startsWith('http') 
                ? review.tenant.profilePicture 
                : `${API_BASE}${review.tenant.profilePicture}`}
              alt={review.tenant?.name}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-6 w-6 text-primary-600" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900">{review.tenant?.name}</p>
              {review.verified && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Verified Tenant
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {format(new Date(review.createdAt), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} size="medium" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 mb-2">{review.title}</h3>

      {/* Comment */}
      <p className="text-gray-700 mb-4">{review.comment}</p>

      {/* Pros and Cons */}
      {(review.pros?.length > 0 || review.cons?.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {review.pros?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-green-700 mb-2">✓ Pros</p>
              <ul className="space-y-1">
                {review.pros.map((pro, index) => (
                  <li key={index} className="text-sm text-gray-600">• {pro}</li>
                ))}
              </ul>
            </div>
          )}
          {review.cons?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-red-700 mb-2">✗ Cons</p>
              <ul className="space-y-1">
                {review.cons.map((con, index) => (
                  <li key={index} className="text-sm text-gray-600">• {con}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Images */}
      {review.images?.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image.startsWith('http') ? image : `${API_BASE}${image}`}
              alt={`Review ${index + 1}`}
              className="h-24 w-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => window.open(image.startsWith('http') ? image : `${API_BASE}${image}`, '_blank')}
            />
          ))}
        </div>
      )}

      {/* Helpful Button */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => onHelpful(review._id)}
          className={`flex items-center gap-2 text-sm ${
            isHelpful ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
          } transition-colors`}
        >
          <ThumbsUp className={`h-4 w-4 ${isHelpful ? 'fill-current' : ''}`} />
          Helpful ({review.helpfulCount || 0})
        </button>

        {isOwner && !review.response?.text && (
          <button
            onClick={() => onResponse(review._id)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Respond
          </button>
        )}
      </div>

      {/* Owner Response */}
      {review.response?.text && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-primary-500">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-primary-600" />
            <p className="text-sm font-semibold text-gray-900">Owner Response</p>
          </div>
          <p className="text-sm text-gray-700 mb-2">{review.response.text}</p>
          <p className="text-xs text-gray-500">
            {format(new Date(review.response.respondedAt), 'MMM dd, yyyy')}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
