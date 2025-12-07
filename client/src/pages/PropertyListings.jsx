import { useState, useEffect } from 'react';
import { getProperties } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { Search, Filter, X } from 'lucide-react';

const PropertyListings = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    minRent: '',
    maxRent: '',
    bedrooms: '',
    propertyType: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async (filterParams = {}) => {
    try {
      setLoading(true);
      const response = await getProperties(filterParams);
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    );
    fetchProperties(activeFilters);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      minRent: '',
      maxRent: '',
      bedrooms: '',
      propertyType: '',
    });
    fetchProperties();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Properties</h1>
          <p className="text-gray-600">Find your perfect home from our listings</p>
        </div>

        {/* Search and Filter */}
        <div className="card p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by title or description..."
                  className="input-field"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline flex items-center justify-center"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </button>
              <button type="submit" className="btn-primary flex items-center justify-center">
                <Search className="h-5 w-5 mr-2" />
                Search
              </button>
            </div>

            {showFilters && (
              <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 animate-slide-down">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={filters.city}
                    onChange={handleFilterChange}
                    placeholder="e.g., Mumbai"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Rent</label>
                  <input
                    type="number"
                    name="minRent"
                    value={filters.minRent}
                    onChange={handleFilterChange}
                    placeholder="₹ 0"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Rent</label>
                  <input
                    type="number"
                    name="maxRent"
                    value={filters.maxRent}
                    onChange={handleFilterChange}
                    placeholder="₹ 100000"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                  <select name="bedrooms" value={filters.bedrooms} onChange={handleFilterChange} className="input-field">
                    <option value="">Any</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4+ BHK</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                  <select name="propertyType" value={filters.propertyType} onChange={handleFilterChange} className="input-field">
                    <option value="">Any</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="studio">Studio</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="btn-outline w-full flex items-center justify-center"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Clear
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="spinner"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No properties found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-gray-600">{properties.length} properties found</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyListings;
