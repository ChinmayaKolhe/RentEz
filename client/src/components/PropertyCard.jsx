import { Link } from 'react-router-dom';
import { Bed, Bath, MapPin, IndianRupee } from 'lucide-react';

const PropertyCard = ({ property }) => {
  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const mainImage = property.images?.[0] 
    ? (property.images[0].startsWith('http') ? property.images[0] : `${API_BASE}${property.images[0]}`)
    : 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <Link to={`/properties/${property._id}`} className="card group">
      <div className="relative overflow-hidden h-64">
        <img
          src={mainImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            property.status === 'available' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {property.status}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
          {property.title}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm line-clamp-1">
            {property.address?.city}, {property.address?.state}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {property.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-gray-600">
            <div className="flex items-center">
              <Bed className="h-5 w-5 mr-1" />
              <span className="text-sm">{property.bedrooms}</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-5 w-5 mr-1" />
              <span className="text-sm">{property.bathrooms}</span>
            </div>
          </div>
          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
            {property.propertyType}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center">
            <IndianRupee className="h-5 w-5 text-primary-600" />
            <span className="text-2xl font-bold text-primary-600">
              ₹{property.rent?.toLocaleString()}
            </span>
            <span className="text-gray-500 text-sm ml-1">/month</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
