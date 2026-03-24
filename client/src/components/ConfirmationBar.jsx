const ConfirmationBar = ({ confirmations = 0, total = 60 }) => {
  const percentage = Math.min((confirmations / total) * 100, 100);
  const isComplete = confirmations >= total;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Household Confirmations</span>
        <span className={`text-sm font-bold ${isComplete ? 'text-green-600' : 'text-gray-600'}`}>
          {confirmations}/{total}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isComplete ? 'bg-green-500' : percentage > 50 ? 'bg-primary-500' : 'bg-yellow-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isComplete && (
        <p className="text-xs text-green-600 mt-1">✅ Pickup confirmed by community</p>
      )}
    </div>
  );
};

export default ConfirmationBar;
