import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/citizen/Dashboard';
import CitizenReport from './pages/citizen/Report';
import CitizenAlerts from './pages/citizen/Alerts';
import MunicipalDashboard from './pages/municipal/Dashboard';
import MunicipalInsights from './pages/municipal/Insights';
import MunicipalAlerts from './pages/municipal/Alerts';
import ComplaintDetail from './pages/municipal/ComplaintDetail';

// Layout wrapper for municipal pages
const MunicipalLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Sidebar />
    <div className="lg:ml-64 pt-14 lg:pt-0">
      {children}
    </div>
  </div>
);

// Home redirect based on role
const HomeRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return <Navigate to={user.role === 'municipal' ? '/municipal/dashboard' : '/citizen/dashboard'} />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Citizen routes */}
          <Route path="/citizen/dashboard" element={
            <ProtectedRoute role="citizen">
              <CitizenDashboard />
            </ProtectedRoute>
          } />
          <Route path="/citizen/report" element={
            <ProtectedRoute role="citizen">
              <CitizenReport />
            </ProtectedRoute>
          } />
          <Route path="/citizen/alerts" element={
            <ProtectedRoute role="citizen">
              <CitizenAlerts />
            </ProtectedRoute>
          } />

          {/* Municipal routes */}
          <Route path="/municipal/dashboard" element={
            <ProtectedRoute role="municipal">
              <MunicipalLayout><MunicipalDashboard /></MunicipalLayout>
            </ProtectedRoute>
          } />
          <Route path="/municipal/insights" element={
            <ProtectedRoute role="municipal">
              <MunicipalLayout><MunicipalInsights /></MunicipalLayout>
            </ProtectedRoute>
          } />
          <Route path="/municipal/alerts" element={
            <ProtectedRoute role="municipal">
              <MunicipalLayout><MunicipalAlerts /></MunicipalLayout>
            </ProtectedRoute>
          } />
          <Route path="/municipal/complaints/:id" element={
            <ProtectedRoute role="municipal">
              <MunicipalLayout><ComplaintDetail /></MunicipalLayout>
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
