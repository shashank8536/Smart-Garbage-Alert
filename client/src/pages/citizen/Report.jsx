import { useState } from 'react';
import API from '../../api/axios';
import AIResultCard from '../../components/AIResultCard';
import { Camera, MapPin, Send, Loader2 } from 'lucide-react';

const COMPLAINT_TYPES = [
  { value: 'Open Dumping', label: '🚯 Open Dumping', hint: 'Illegal garbage dumped in open areas' },
  { value: 'Dustbin Overflow', label: '🗑️ Dustbin Overflow', hint: 'Overflowing public dustbins' },
  { value: 'Missed Pickup', label: '🚛 Missed Pickup', hint: 'Garbage truck did not collect waste' },
  { value: 'Street Littering', label: '🧹 Street Littering', hint: 'Waste scattered on roads/streets' },
  { value: 'Other', label: '📋 Other Issue', hint: 'Any other waste management problem' },
];

const Report = () => {
  const [complaintType, setComplaintType] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState({ lat: '', lng: '', address: '' });
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const detectLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Try to get address from coordinates
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();
            setLocation({
              lat: latitude,
              lng: longitude,
              address: data.display_name || `${latitude}, ${longitude}`,
            });
          } catch {
            setLocation({
              lat: latitude,
              lng: longitude,
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            });
          }
          setLocating(false);
        },
        (err) => {
          setError('Location access denied. Please enable location services.');
          setLocating(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('description', `[${complaintType}] ${description}`);
      if (image) formData.append('image', image);
      formData.append('lat', location.lat);
      formData.append('lng', location.lng);
      formData.append('address', location.address);

      const { data } = await API.post('/complaints/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(data);
      // Reset form
      setComplaintType('');
      setDescription('');
      setImage(null);
      setImagePreview(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Report Waste Issue</h1>
      <p className="text-gray-500 text-sm mb-6">
        Report any waste management problem — open dumping, overflowing dustbins, missed pickups, or littering.
        Our AI will analyze and categorize your complaint instantly.
      </p>

      {/* Report Form */}
      {!result && (
        <form onSubmit={handleSubmit} className="card space-y-5">
          {/* Complaint Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type of Issue *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COMPLAINT_TYPES.map((type) => (
                <button
                  type="button"
                  key={type.value}
                  onClick={() => setComplaintType(type.value)}
                  className={`text-left p-3 rounded-lg border-2 transition-all ${
                    complaintType === type.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm">{type.label}</p>
                  <p className="text-xs text-gray-400">{type.hint}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Describe the Problem *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field min-h-[120px] resize-none"
              placeholder={complaintType === 'Dustbin Overflow'
                ? 'E.g., The public dustbin near market gate is completely full and overflowing onto the road...'
                : complaintType === 'Missed Pickup'
                ? 'E.g., The garbage truck has not come to our street for the past 3 days...'
                : 'E.g., Large pile of garbage dumped near the park entrance, causing foul smell...'}
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Photo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => { setImage(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click to upload image</p>
                  <p className="text-xs text-gray-400">JPG, PNG up to 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <button
              type="button"
              onClick={detectLocation}
              disabled={locating}
              className="btn-secondary w-full flex items-center justify-center gap-2 mb-3"
            >
              {locating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              {locating ? 'Detecting location...' : 'Auto-detect My Location'}
            </button>

            {location.address && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                <p className="text-green-700 font-medium">📍 Location detected:</p>
                <p className="text-green-600 text-xs mt-1">{location.address}</p>
                <p className="text-green-500 text-xs mt-1">
                  Lat: {parseFloat(location.lat).toFixed(4)}, Lng: {parseFloat(location.lng).toFixed(4)}
                </p>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !description || !complaintType}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                AI is analyzing your complaint...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Submit Report
              </>
            )}
          </button>
        </form>
      )}

      {/* AI Result */}
      {result && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-700 font-semibold">✅ {result.message}</p>
          </div>

          <AIResultCard
            aiAnalysis={result.aiAnalysis}
            notification={result.complaint?.aiNotification}
          />

          <button
            onClick={() => setResult(null)}
            className="btn-secondary w-full"
          >
            Report Another Issue
          </button>
        </div>
      )}
    </div>
  );
};

export default Report;
