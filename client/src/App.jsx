import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PropertyListings from './pages/PropertyListings';
import PropertyDetails from './pages/PropertyDetails';
import OwnerDashboard from './pages/OwnerDashboard';
import TenantDashboard from './pages/TenantDashboard';
import AddProperty from './pages/AddProperty';
import RentStatus from './pages/RentStatus';
import Chat from './pages/Chat';
import MyApplications from './pages/MyApplications';
import ReceivedApplications from './pages/ReceivedApplications';
import Analytics from './pages/Analytics';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<PropertyListings />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" replace /> : <Signup />}
        />

        {/* Protected routes - Owner */}
        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/add-property"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <AddProperty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/edit-property/:id"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <AddProperty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/applications"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <ReceivedApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/analytics"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <Analytics />
            </ProtectedRoute>
          }
        />

        {/* Protected routes - Tenant */}
        <Route
          path="/tenant/dashboard"
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <TenantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tenant/applications"
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <MyApplications />
            </ProtectedRoute>
          }
        />

        {/* Protected routes - Both */}
        <Route
          path="/rent-status"
          element={
            <ProtectedRoute allowedRoles={['owner', 'tenant']}>
              <RentStatus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute allowedRoles={['owner', 'tenant']}>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:userId"
          element={
            <ProtectedRoute allowedRoles={['owner', 'tenant']}>
              <Chat />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
