import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import ComplaintCard from '../../components/ComplaintCard';
import { Link } from 'react-router-dom';
import { AlertTriangle, Award, FileText, Plus, Recycle } from 'lucide-react';

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const { data } = await API.get('/complaints/my');
      setComplaints(data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (complaintId) => {
    try {
      const { data } = await API.post(`/complaints/${complaintId}/confirm`);
      alert(data.message);
      // Update reward points
      if (user) {
        updateUser({ ...user, rewardPoints: (user.rewardPoints || 0) + 5 });
      }
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Error confirming pickup');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 sm:p-8 mb-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Welcome, {user?.name}! 👋</h1>
            <p className="text-primary-100 text-sm">
              Thank you for keeping our city clean. Your ward: <strong>{user?.ward || 'Not assigned'}</strong>
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
            <Award className="h-6 w-6 mx-auto mb-1" />
            <p className="text-2xl font-bold">{user?.rewardPoints || 0}</p>
            <p className="text-xs text-primary-100">Reward Points</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link to="/citizen/report" className="card flex items-center gap-4 group cursor-pointer hover:border-primary-300">
          <div className="bg-red-100 group-hover:bg-red-200 p-3 rounded-xl transition-colors">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Report Issue</p>
            <p className="text-xs text-gray-500">Dumping, overflow, missed pickup</p>
          </div>
        </Link>

        <Link to="/citizen/alerts" className="card flex items-center gap-4 group cursor-pointer hover:border-primary-300">
          <div className="bg-blue-100 group-hover:bg-blue-200 p-3 rounded-xl transition-colors">
            <Recycle className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Collection Alerts</p>
            <p className="text-xs text-gray-500">View pickup schedules</p>
          </div>
        </Link>

        <div className="card flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl">
            <FileText className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">{complaints.length}</p>
            <p className="text-xs text-gray-500">Total Complaints</p>
          </div>
        </div>
      </div>

      {/* My Complaints */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">My Complaints</h2>
        <Link to="/citizen/report" className="btn-primary text-sm py-2 px-4 flex items-center gap-1">
          <Plus className="h-4 w-4" /> New Report
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <div className="card text-center py-12">
          <Recycle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No complaints yet</p>
          <p className="text-sm text-gray-400">Report any waste management issues in your area</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <ComplaintCard
              key={complaint._id}
              complaint={complaint}
              showConfirm={true}
              onConfirm={handleConfirm}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
