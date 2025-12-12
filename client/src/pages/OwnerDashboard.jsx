import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOwnerProperties, deleteProperty } from '../services/api';
import { Plus, Edit, Trash2, Eye, User as UserIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const profilePicUrl = user?.profilePicture?.startsWith('http') 
    ? user.profilePicture 
    : user?.profilePicture 
    ? `${API_BASE}${user.profilePicture}` 
    : null;

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await getOwnerProperties();
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      await deleteProperty(id);
      setProperties(properties.filter((p) => p._id !== id));
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Section */}
        <div className="card p-6 mb-8 bg-gradient-to-r from-primary-50 to-secondary-50">
          <div className="flex items-center gap-4">
            {profilePicUrl ? (
              <img 
                src={profilePicUrl} 
                alt={user?.name} 
                className="h-16 w-16 rounded-full object-cover border-4 border-white shadow-lg" 
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h2>
              <p className="text-gray-600">Manage your properties and track your rentals</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Properties</h1>
            <p className="text-gray-600">Manage your property listings</p>
          </div>
          <Link to="/owner/add-property" className="btn-primary flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add Property
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">You haven't listed any properties yet</p>
            <Link to="/owner/add-property" className="btn-primary inline-flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Property
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property._id} className="card">
                <div className="relative h-48">
                  <img
                    src={
                      property.images?.[0] 
                        ? (property.images[0].startsWith('http') 
                            ? property.images[0] 
                            : `${API_BASE}${property.images[0]}`)
                        : 'https://via.placeholder.com/400x300?text=No+Image'
                    }
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
                    property.status === 'available' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {property.status}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 line-clamp-1">{property.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-primary-600">₹{property.rent?.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">/month</span>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/properties/${property._id}`} className="flex-1 btn-outline text-center flex items-center justify-center">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                    <Link to={`/owner/edit-property/${property._id}`} className="flex-1 btn-secondary text-center flex items-center justify-center">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(property._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
