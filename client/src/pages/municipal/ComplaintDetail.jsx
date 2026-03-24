import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import SeverityBadge from '../../components/SeverityBadge';
import ConfirmationBar from '../../components/ConfirmationBar';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, Brain, MapPin, User, Calendar, Loader2 } from 'lucide-react';

const createIcon = (color) => new L.DivIcon({
  html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const severityColors = { High: '#ef4444', Medium: '#f97316', Low: '#22c55e' };

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const { data } = await API.get(`/dashboard/complaints/${id}`);
      setComplaint(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await API.patch(`/dashboard/complaints/${id}/status`, { status });
      setComplaint(prev => ({
        ...prev,
        status,
        ...(status === 'Resolved' ? { resolvedAt: new Date() } : {}),
      }));
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Complaint not found</p>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/municipal/dashboard')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Image + Details */}
        <div className="space-y-4">
          {/* Image */}
          {complaint.imageUrl && (
            <div className="card p-0 overflow-hidden">
              <img
                src={complaint.imageUrl}
                alt="Complaint"
                className="w-full h-64 object-cover"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/600x300?text=Image+Not+Available'; }}
              />
            </div>
          )}

          {/* Details */}
          <div className="card">
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <SeverityBadge severity={complaint.severity} />
              <span className={`badge ${
                complaint.status === 'Pending' ? 'badge-pending' :
                complaint.status === 'In Progress' ? 'badge-inprogress' :
                complaint.status === 'Resolved' ? 'badge-resolved' : 'badge-escalated'
              }`}>
                {complaint.status}
              </span>
              <span className="badge bg-gray-100 text-gray-600">{complaint.category}</span>
            </div>

            <p className="text-gray-700 mb-4">{complaint.description}</p>

            <div className="space-y-2 text-sm text-gray-500">
              <p className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {complaint.citizenId?.name || 'Anonymous'} ({complaint.citizenId?.email})
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {complaint.location?.address || 'Unknown'}
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(complaint.createdAt)}
              </p>
            </div>

            {/* Status Actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t flex-wrap">
              {['Pending', 'In Progress', 'Resolved', 'Escalated'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={complaint.status === status}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    complaint.status === status
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Confirmation Bar */}
          <div className="card">
            <ConfirmationBar
              confirmations={complaint.confirmations?.length || 0}
              total={60}
            />
          </div>
        </div>

        {/* RIGHT: Map + AI Analysis */}
        <div className="space-y-4">
          {/* Map */}
          {complaint.location?.lat && complaint.location?.lng && (
            <div className="card p-0 overflow-hidden" style={{ height: '250px' }}>
              <MapContainer
                center={[complaint.location.lat, complaint.location.lng]}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={[complaint.location.lat, complaint.location.lng]}
                  icon={createIcon(severityColors[complaint.severity] || '#f97316')}
                >
                  <Popup>{complaint.location.address}</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}

          {/* AI Analysis */}
          <div className="card border-l-4 border-l-primary-500">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-primary-500" />
              <h3 className="font-semibold text-gray-800">AI Analysis</h3>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">AI Summary</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                  {complaint.aiSummary || 'No AI analysis available'}
                </p>
              </div>

              {complaint.aiRecommendedAction && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Recommended Action</p>
                  <p className="text-sm text-primary-700 bg-primary-50 rounded-lg p-3">
                    {complaint.aiRecommendedAction}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
