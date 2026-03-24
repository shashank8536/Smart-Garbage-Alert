import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import NotificationBubble from '../../components/NotificationBubble';
import { Bell, Send, Loader2, Clock } from 'lucide-react';

const MunicipalAlerts = () => {
  const { user } = useAuth();
  const [wardName, setWardName] = useState(user?.ward || 'Ward 12 - Sadar Bazaar');
  const [collectionTime, setCollectionTime] = useState('08:00');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [sent, setSent] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const wardEncoded = encodeURIComponent(user?.ward || 'Ward 12 - Sadar Bazaar');
      const { data } = await API.get(`/alerts/${wardEncoded}`);
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setAlertsLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPreview(null);
    setSent(false);

    try {
      const { data } = await API.post('/alerts/send', {
        wardName,
        collectionTime,
        context,
      });
      setPreview(data.notification);
      setSent(true);
      fetchAlerts(); // Refresh alerts list
      // Reset form
      setContext('');
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format time for display
  const formatTime = (time) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-800">Send Smart Alert</h1>
      </div>

      {/* Alert Composer */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Generate AI Notification</h2>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ward Name</label>
              <select
                value={wardName}
                onChange={(e) => setWardName(e.target.value)}
                className="input-field"
              >
                <option value="Ward 12 - Sadar Bazaar">Ward 12 - Sadar Bazaar</option>
                <option value="Ward 5 - Civil Lines">Ward 5 - Civil Lines</option>
                <option value="Ward 8 - Taj Nagar">Ward 8 - Taj Nagar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Collection Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="time"
                  value={collectionTime}
                  onChange={(e) => setCollectionTime(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Context Notes (optional)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="input-field min-h-[80px] resize-none"
              placeholder="E.g., Festival day - extra waste expected, Route changed due to road repair..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                AI is generating notification...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Generate & Send Alert
              </>
            )}
          </button>
        </form>

        {/* Preview */}
        {preview && (
          <div className="mt-6 pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">✅ AI-Generated Notification:</p>
            <div className="bg-green-50 rounded-2xl rounded-tl-sm p-4 text-sm text-green-800 shadow-sm border border-green-200">
              {preview}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Sent to {wardName} • Collection at {formatTime(collectionTime)}
            </p>
          </div>
        )}
      </div>

      {/* Alert History */}
      <div>
        <h2 className="font-semibold text-gray-800 mb-4">Alert History</h2>
        {alertsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="card text-center py-8">
            <Bell className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No alerts sent yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <NotificationBubble
                key={index}
                message={alert.message}
                wardName={wardName}
                timestamp={alert.createdAt}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MunicipalAlerts;
