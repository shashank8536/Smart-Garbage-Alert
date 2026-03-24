import SeverityBadge from './SeverityBadge';
import { MapPin, Clock, CheckCircle } from 'lucide-react';

const ComplaintCard = ({ complaint, onConfirm, showConfirm = false }) => {
  const statusClasses = {
    'Pending': 'badge-pending',
    'In Progress': 'badge-inprogress',
    'Resolved': 'badge-resolved',
    'Escalated': 'badge-escalated',
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="card hover:border-primary-200">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Image */}
        {complaint.imageUrl && (
          <div className="sm:w-32 sm:h-24 w-full h-40 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={complaint.imageUrl}
              alt="Complaint"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/200x150?text=No+Image'; }}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <SeverityBadge severity={complaint.severity} />
            <span className={`badge ${statusClasses[complaint.status]}`}>
              {complaint.status}
            </span>
            <span className="badge bg-gray-100 text-gray-600">
              {complaint.category}
            </span>
          </div>

          <p className="text-sm text-gray-700 mb-2 line-clamp-2">
            {complaint.aiSummary || complaint.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {complaint.location?.address || 'Unknown location'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(complaint.createdAt)}
            </span>
            {complaint.confirmations && (
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {complaint.confirmations.length}/60 confirmed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Confirm button */}
      {showConfirm && complaint.status === 'Pending' && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => onConfirm(complaint._id)}
            className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Confirm Pickup
          </button>
        </div>
      )}
    </div>
  );
};

export default ComplaintCard;
