const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema({
  wardName: {
    type: String,
    required: [true, 'Ward name is required'],
    trim: true,
  },
  wardNumber: {
    type: Number,
    required: [true, 'Ward number is required'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  totalHouseholds: {
    type: Number,
    default: 100,
  },
  municipalOfficerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  alerts: [{
    message: { type: String },
    collectionTime: { type: String },
    context: { type: String },
    createdAt: { type: Date, default: Date.now },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Ward', wardSchema);
