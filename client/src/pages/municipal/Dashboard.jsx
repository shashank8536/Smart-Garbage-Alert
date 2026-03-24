import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import StatCard from '../../components/StatCard';
import SeverityBadge from '../../components/SeverityBadge';
import { FileText, Clock, CheckCircle, AlertTriangle, Search, MapPin, Eye, Activity } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icons by severity
const createIcon = (color) => new L.DivIcon({
  html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const severityIcons = {
  High: createIcon('#ef4444'),
  Medium: createIcon('#f97316'),
  Low: createIcon('#22c55e'),
};

const MunicipalDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, [filter, search]);

  const fetchComplaints = async () => {
    try {
      const params = {};
      if (filter !== 'All') {
        if (['High', 'Medium', 'Low'].includes(filter)) {
          params.severity = filter;
        } else {
          params.status = filter;
        }
      }
      if (search) params.search = search;

      const { data } = await API.get('/dashboard/complaints', { params });
      setComplaints(data.complaints || []);
      setStats(data.stats || {});
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      // Optimistic update
      setComplaints(prev => prev.map(c =>
        c._id === complaintId ? { ...c, status: newStatus } : c
      ));
      await API.patch(`/dashboard/complaints/${complaintId}/status`, { status: newStatus });
    } catch (err) {
      fetchComplaints(); // Rollback
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  };

  const mapComplaints = complaints.filter(c => c.location?.lat && c.location?.lng);
  const defaultCenter = mapComplaints.length > 0
    ? [mapComplaints[0].location.lat, mapComplaints[0].location.lng]
    : [27.1767, 78.0081]; // Agra default

  const filters = ['All', 'Pending', 'In Progress', 'Resolved', 'Escalated', 'High'];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Municipal Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard title="Total Complaints" value={stats.total || 0} icon={FileText} color="blue" />
        <StatCard title="Pending" value={stats.pending || 0} icon={Clock} color="yellow" />
        <StatCard title="In Progress" value={stats.inProgress || 0} icon={Activity} color="indigo" />
        <StatCard title="Resolved Today" value={stats.resolvedToday || 0} icon={CheckCircle} color="green" />
        <StatCard title="Escalated" value={stats.escalated || 0} icon={AlertTriangle} color="red" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Complaints List */}
        <div>
          {/* Search & Filters */}
          <div className="mb-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filter === f
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Complaints */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="card animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))
            ) : complaints.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-gray-500">No complaints found</p>
              </div>
            ) : (
              complaints.map((c) => (
                <div key={c._id} className="card hover:border-primary-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <SeverityBadge severity={c.severity} />
                      <span className={`badge ${
                        c.status === 'Pending' ? 'badge-pending' :
                        c.status === 'In Progress' ? 'badge-inprogress' :
                        c.status === 'Resolved' ? 'badge-resolved' : 'badge-escalated'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <Link
                      to={`/municipal/complaints/${c._id}`}
                      className="text-primary-500 hover:text-primary-600 text-xs font-medium flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" /> View
                    </Link>
                  </div>

                  <p className="text-xs text-gray-500 mb-1">
                    👤 {c.citizenId?.name || 'Anonymous'}
                  </p>

                  {c.aiSummary && (
                    <div className="bg-gray-50 rounded-lg p-2 mb-2">
                      <p className="text-xs text-gray-600">{c.aiSummary}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {c.location?.address?.substring(0, 40) || 'Unknown'}
                    </span>
                    <span>{formatDate(c.createdAt)}</span>
                  </div>

                  {/* Status dropdown */}
                  <select
                    value={c.status}
                    onChange={(e) => handleStatusChange(c._id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Escalated">Escalated</option>
                  </select>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Map */}
        <div className="card p-0 overflow-hidden" style={{ minHeight: '500px' }}>
          <div className="p-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">📍 Complaint Map</h3>
          </div>
          <MapContainer
            center={defaultCenter}
            zoom={14}
            style={{ height: '460px', width: '100%' }}
          >
            <TileLayer
              attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mapComplaints.map((c) => (
              <Marker
                key={c._id}
                position={[c.location.lat, c.location.lng]}
                icon={severityIcons[c.severity] || severityIcons.Medium}
              >
                <Popup>
                  <div className="text-xs max-w-[200px]">
                    <p className="font-semibold">{c.category}</p>
                    <p className="text-gray-600 mt-1">{c.aiSummary || c.description}</p>
                    <p className="text-gray-400 mt-1">{c.location.address}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MunicipalDashboard;
