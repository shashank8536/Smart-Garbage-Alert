import SeverityBadge from './SeverityBadge';
import { Brain, Bell, Lightbulb } from 'lucide-react';

const AIResultCard = ({ aiAnalysis, notification }) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* AI Analysis Card */}
      <div className="card border-l-4 border-l-primary-500">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-5 w-5 text-primary-500" />
          <h3 className="font-semibold text-gray-800">AI Analysis Result</h3>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <span className="text-xs text-gray-500 block mb-1">Severity</span>
            <SeverityBadge severity={aiAnalysis.severity} />
          </div>
          <div>
            <span className="text-xs text-gray-500 block mb-1">Category</span>
            <span className="badge bg-gray-100 text-gray-700">{aiAnalysis.category}</span>
          </div>
        </div>

        <div className="mb-3">
          <span className="text-xs text-gray-500 block mb-1">AI Summary</span>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
            {aiAnalysis.summary}
          </p>
        </div>

        {aiAnalysis.recommendedAction && (
          <div>
            <span className="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <Lightbulb className="h-3 w-3" /> Recommended Action
            </span>
            <p className="text-sm text-primary-700 bg-primary-50 rounded-lg p-3">
              {aiAnalysis.recommendedAction}
            </p>
          </div>
        )}
      </div>

      {/* Notification Bubble */}
      {notification && (
        <div className="card border-l-4 border-l-blue-400">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-gray-800">Smart Notification</h3>
          </div>
          <div className="bg-green-50 rounded-2xl rounded-tl-sm p-4 text-sm text-green-800 shadow-sm">
            {notification}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIResultCard;
