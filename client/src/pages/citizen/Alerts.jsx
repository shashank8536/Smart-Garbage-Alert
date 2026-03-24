import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import NotificationBubble from '../../components/NotificationBubble';
import { Bell, Loader2 } from 'lucide-react';

const Alerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const wardName = encodeURIComponent(user?.ward || 'Ward 12 - Sadar Bazaar');
      const { data } = await API.get(`/alerts/${wardName}`);
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary-100 p-2.5 rounded-xl">
          <Bell className="h-6 w-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Collection Alerts</h1>
          <p className="text-sm text-gray-500">Smart notifications for {user?.ward || 'your ward'}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="card text-center py-12">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No alerts yet</p>
          <p className="text-sm text-gray-400">
            You'll receive smart notifications when garbage collection is scheduled.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <NotificationBubble
              key={index}
              message={alert.message}
              wardName={user?.ward || 'Your Ward'}
              timestamp={alert.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
