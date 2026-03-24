import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Brain, Loader2, RefreshCw, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CHART_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

const Insights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/dashboard/insights');
      setInsights(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sentimentConfig = {
    Positive: { color: 'text-green-600', bg: 'bg-green-50', icon: '😊', border: 'border-green-200' },
    Neutral: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '😐', border: 'border-yellow-200' },
    Negative: { color: 'text-red-600', bg: 'bg-red-50', icon: '😟', border: 'border-red-200' },
  };

  const chartData = insights?.complaintsByCategory
    ? Object.entries(insights.complaintsByCategory).map(([name, value]) => ({ name, value }))
    : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
        <p className="text-gray-500 font-medium">Generating AI Insights...</p>
        <p className="text-gray-400 text-sm">Analyzing citizen feedback with GenAI</p>
      </div>
    );
  }

  const sentiment = sentimentConfig[insights?.sentiment] || sentimentConfig.Neutral;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-800">AI Insights</h1>
        </div>
        <button
          onClick={fetchInsights}
          className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Sentiment Card */}
      <div className={`card ${sentiment.bg} border ${sentiment.border} mb-6`}>
        <div className="flex items-center gap-4">
          <span className="text-4xl">{sentiment.icon}</span>
          <div>
            <p className="text-sm text-gray-500">Overall Citizens Sentiment</p>
            <p className={`text-2xl font-bold ${sentiment.color}`}>{insights?.sentiment || 'Neutral'}</p>
            <p className="text-xs text-gray-400 mt-1">
              Based on {insights?.totalAnalyzed || 0} complaints analyzed
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Key Issues */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <h2 className="font-semibold text-gray-800">Key Issues Identified</h2>
          </div>
          <ul className="space-y-2">
            {(insights?.keyIssues || []).map((issue, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="bg-red-100 text-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {issue}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <h2 className="font-semibold text-gray-800">AI Recommendations</h2>
          </div>
          <ol className="space-y-2">
            {(insights?.recommendations || []).map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="bg-primary-100 text-primary-600 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {rec}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary-500" />
          <h2 className="font-semibold text-gray-800">Complaints by Category</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Insights;
