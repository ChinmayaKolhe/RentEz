import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Building2, Search, Shield, MessageSquare, ArrowRight } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Find Your Perfect Home with <span className="text-yellow-300">RentEz</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white text-opacity-90 animate-slide-up">
              Connecting Property Owners and Tenants Seamlessly
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/properties" className="btn-secondary bg-white hover:bg-gray-100">
                <Search className="inline-block mr-2 h-5 w-5" />
                Browse Properties
              </Link>
              {!user && (
                <Link to="/signup" className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Get Started
                  <ArrowRight className="inline-block ml-2 h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose RentEz?</h2>
            <p className="text-xl text-gray-600">Everything you need for property rental management</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 text-center hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Easy Property Listing</h3>
              <p className="text-gray-600">
                List your properties with multiple images, detailed descriptions, and location mapping in minutes.
              </p>
            </div>

            <div className="card p-8 text-center hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-Time Chat</h3>
              <p className="text-gray-600">
                Connect instantly with property owners or tenants through our integrated real-time messaging system.
              </p>
            </div>

            <div className="card p-8 text-center hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure & Reliable</h3>
              <p className="text-gray-600">
                Track rent payments, get automated reminders, and manage everything from one secure dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-white text-opacity-90">
            Join thousands of property owners and tenants using RentEz
          </p>
          {!user ? (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup?role=owner" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg">
                I'm a Property Owner
              </Link>
              <Link to="/signup?role=tenant" className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-all duration-300 shadow-lg">
                I'm Looking to Rent
              </Link>
            </div>
          ) : (
            <Link to="/properties" className="btn-secondary bg-white hover:bg-gray-100 inline-block">
              Explore Properties
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building2 className="h-6 w-6" />
            <span className="text-xl font-bold">RentEz</span>
          </div>
          <p className="text-gray-400">© 2025 RentEz. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
