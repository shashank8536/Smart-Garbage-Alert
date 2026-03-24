const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  location: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
    address: { type: String, default: 'Unknown location' },
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  category: {
    type: String,
    enum: ['Open Dumping', 'Missed Pickup', 'Overflow', 'Other'],
    default: 'Other',
  },
  aiSummary: {
    type: String,
    default: '',
  },
  aiRecommendedAction: {
    type: String,
    default: '',
  },
  aiNotification: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Escalated'],
    default: 'Pending',
  },
  confirmations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  ward: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model('Complaint', complaintSchema);
