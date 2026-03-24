const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { analyzeComplaint } = require('../utils/claudeAI');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'garbage-alerts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }],
  },
});

const upload = multer({ storage: storage });

// @desc    Submit a new complaint
// @route   POST /api/complaints/submit
// @access  Private (citizen)
const submitComplaint = async (req, res) => {
  try {
    const { description, lat, lng, address } = req.body;
    let imageUrl = '';

    // Handle image upload
    if (req.file) {
      imageUrl = req.file.path;
    }

    // Call Claude AI to analyze the complaint
    const aiAnalysis = await analyzeComplaint(
      description,
      imageUrl ? 'Image of reported waste/dumping issue attached' : ''
    );

    // Create complaint
    const complaint = await Complaint.create({
      citizenId: req.user._id,
      description,
      imageUrl,
      location: {
        lat: parseFloat(lat) || 0,
        lng: parseFloat(lng) || 0,
        address: address || 'Unknown location',
      },
      severity: aiAnalysis.severity,
      category: aiAnalysis.category,
      aiSummary: aiAnalysis.summary,
      aiRecommendedAction: aiAnalysis.recommendedAction,
      ward: req.user.ward || '',
      status: 'Pending',
    });

    // Award reward points for reporting
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { rewardPoints: 10 },
    });

    res.status(201).json({
      complaint,
      aiAnalysis,
      message: 'Complaint submitted successfully! +10 reward points earned.',
    });
  } catch (error) {
    console.error('Submit complaint error:', error.message);
    res.status(500).json({ message: 'Error submitting complaint' });
  }
};

// @desc    Get logged-in citizen's complaints
// @route   GET /api/complaints/my
// @access  Private (citizen)
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ citizenId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complaints' });
  }
};

// @desc    Confirm garbage pickup for a complaint
// @route   POST /api/complaints/:id/confirm
// @access  Private (citizen)
const confirmPickup = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user already confirmed
    if (complaint.confirmations.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already confirmed pickup for this complaint' });
    }

    // Add confirmation
    complaint.confirmations.push(req.user._id);

    // If 60+ confirmations, auto-resolve
    if (complaint.confirmations.length >= 60) {
      complaint.status = 'Resolved';
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    // Award points for confirmation
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { rewardPoints: 5 },
    });

    res.json({
      message: 'Pickup confirmed! +5 reward points earned.',
      confirmationCount: complaint.confirmations.length,
      status: complaint.status,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error confirming pickup' });
  }
};

module.exports = { submitComplaint, getMyComplaints, confirmPickup, upload };
