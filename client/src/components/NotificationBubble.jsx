import { Bell } from 'lucide-react';

const NotificationBubble = ({ message, wardName, timestamp }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="card hover:border-primary-200 group">
      <div className="flex gap-3">
        <div className="bg-primary-100 rounded-full p-2.5 h-fit group-hover:bg-primary-200 transition-colors">
          <Bell className="h-5 w-5 text-primary-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-primary-600">{wardName}</span>
            {timestamp && (
              <span className="text-xs text-gray-400">{formatDate(timestamp)}</span>
            )}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationBubble;
