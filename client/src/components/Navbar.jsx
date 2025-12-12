import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Home, Building2, MessageSquare, IndianRupee, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold gradient-text">RentEz</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link to="/properties" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
              <Building2 className="h-5 w-5" />
              <span>Properties</span>
            </Link>

            {user ? (
              <>
                {user.role === 'owner' && (
                  <>
                    <Link to="/owner/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/owner/add-property" className="text-gray-700 hover:text-primary-600 transition-colors">
                      Add Property
                    </Link>
                    <Link to="/owner/analytics" className="text-gray-700 hover:text-primary-600 transition-colors">
                      Analytics
                    </Link>
                    <Link to="/owner/applications" className="text-gray-700 hover:text-primary-600 transition-colors">
                      Applications
                    </Link>
                  </>
                )}
                {user.role === 'tenant' && (
                  <>
                    <Link to="/tenant/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/tenant/applications" className="text-gray-700 hover:text-primary-600 transition-colors">
                      My Applications
                    </Link>
                  </>
                )}
                <Link to="/chat" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                  <MessageSquare className="h-5 w-5" />
                  <span>Chat</span>
                </Link>
                <Link to="/rent-status" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                  <IndianRupee className="h-5 w-5" />
                  <span>Rent</span>
                </Link>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-gray-400 bg-gray-100 rounded-full p-1" />
                    )}
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-primary-600"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-slide-down">
          <div className="px-4 py-4 space-y-3">
            <Link to="/" className="block text-gray-700 hover:text-primary-600 py-2">Home</Link>
            <Link to="/properties" className="block text-gray-700 hover:text-primary-600 py-2">Properties</Link>
            
            {user ? (
              <>
                {user.role === 'owner' && (
                  <>
                    <Link to="/owner/dashboard" className="block text-gray-700 hover:text-primary-600 py-2">Dashboard</Link>
                    <Link to="/owner/add-property" className="block text-gray-700 hover:text-primary-600 py-2">Add Property</Link>
                    <Link to="/owner/applications" className="block text-gray-700 hover:text-primary-600 py-2">Applications</Link>
                  </>
                )}
                {user.role === 'tenant' && (
                  <>
                    <Link to="/tenant/dashboard" className="block text-gray-700 hover:text-primary-600 py-2">Dashboard</Link>
                    <Link to="/tenant/applications" className="block text-gray-700 hover:text-primary-600 py-2">My Applications</Link>
                  </>
                )}
                <Link to="/chat" className="block text-gray-700 hover:text-primary-600 py-2">Chat</Link>
                <Link to="/rent-status" className="block text-gray-700 hover:text-primary-600 py-2">Rent Status</Link>
                <button onClick={handleLogout} className="block w-full text-left text-red-600 hover:text-red-700 py-2">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-700 hover:text-primary-600 py-2">Login</Link>
                <Link to="/signup" className="block btn-primary text-center">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
