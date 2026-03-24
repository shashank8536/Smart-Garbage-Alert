const Complaint = require('../models/Complaint');
const Ward = require('../models/Ward');
const { summarizeFeedback, generateSmartNotification } = require('../utils/claudeAI');

// @desc    Get all complaints for officer's ward (with filters)
// @route   GET /api/dashboard/complaints
// @access  Private (municipal)
const getWardComplaints = async (req, res) => {
  try {
    const { status, severity, search } = req.query;
    const filter = {};

    // Filter by officer's ward
    if (req.user.ward) {
      filter.ward = req.user.ward;
    }

    // Apply filters
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (severity && severity !== 'All') {
      filter.severity = severity;
    }
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
      ];
    }

    const complaints = await Complaint.find(filter)
      .populate('citizenId', 'name email')
      .sort({ createdAt: -1 });

    // Calculate stats
    const allComplaints = await Complaint.find(
      req.user.ward ? { ward: req.user.ward } : {}
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      total: allComplaints.length,
      pending: allComplaints.filter(c => c.status === 'Pending').length,
      inProgress: allComplaints.filter(c => c.status === 'In Progress').length,
      resolved: allComplaints.filter(c => c.status === 'Resolved').length,
      escalated: allComplaints.filter(c => c.status === 'Escalated').length,
      resolvedToday: allComplaints.filter(
        c => c.status === 'Resolved' && c.resolvedAt && c.resolvedAt >= today
      ).length,
      bySeverity: {
        High: allComplaints.filter(c => c.severity === 'High').length,
        Medium: allComplaints.filter(c => c.severity === 'Medium').length,
        Low: allComplaints.filter(c => c.severity === 'Low').length,
      },
      byCategory: {
        'Open Dumping': allComplaints.filter(c => c.category === 'Open Dumping').length,
        'Missed Pickup': allComplaints.filter(c => c.category === 'Missed Pickup').length,
        'Overflow': allComplaints.filter(c => c.category === 'Overflow').length,
        'Other': allComplaints.filter(c => c.category === 'Other').length,
      },
    };

    res.json({ complaints, stats });
  } catch (error) {
    console.error('Get ward complaints error:', error.message);
    res.status(500).json({ message: 'Error fetching complaints' });
  }
};

// @desc    Update complaint status
// @route   PATCH /api/dashboard/complaints/:id/status
// @access  Private (municipal)
const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Escalated'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = status;
    if (status === 'Resolved') {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    res.json({ message: 'Status updated successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: 'Error updating complaint status' });
  }
};

// @desc    Get AI-generated insights for the ward
// @route   GET /api/dashboard/insights
// @access  Private (municipal)
const getInsights = async (req, res) => {
  try {
    const filter = req.user.ward ? { ward: req.user.ward } : {};
    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    if (complaints.length === 0) {
      return res.json({
        sentiment: 'Neutral',
        keyIssues: ['No complaints data available for analysis'],
        recommendations: ['Encourage citizens to report issues through the app'],
        complaintsByCategory: {
          'Open Dumping': 0,
          'Missed Pickup': 0,
          'Overflow': 0,
          'Other': 0,
        },
      });
    }

    // Prepare feedback array from complaints
    const feedbackArray = complaints.map(c =>
      `${c.category}: ${c.description} (Severity: ${c.severity}, Status: ${c.status})`
    );

    // Call Claude AI to analyze feedback
    const aiInsights = await summarizeFeedback(feedbackArray);

    // Count by category
    const complaintsByCategory = {
      'Open Dumping': complaints.filter(c => c.category === 'Open Dumping').length,
      'Missed Pickup': complaints.filter(c => c.category === 'Missed Pickup').length,
      'Overflow': complaints.filter(c => c.category === 'Overflow').length,
      'Other': complaints.filter(c => c.category === 'Other').length,
    };

    res.json({
      ...aiInsights,
      complaintsByCategory,
      totalAnalyzed: complaints.length,
    });
  } catch (error) {
    console.error('Get insights error:', error.message);
    res.status(500).json({ message: 'Error generating insights' });
  }
};

// @desc    Send smart alert for a ward
// @route   POST /api/alerts/send
// @access  Private (municipal)
const sendAlert = async (req, res) => {
  try {
    const { wardName, collectionTime, context } = req.body;

    if (!wardName || !collectionTime) {
      return res.status(400).json({ message: 'Ward name and collection time are required' });
    }

    // Generate AI notification
    const notification = await generateSmartNotification(wardName, collectionTime, context);

    // Save alert to ward
    const ward = await Ward.findOne({ wardName });
    if (ward) {
      ward.alerts.push({
        message: notification,
        collectionTime,
        context: context || '',
      });
      await ward.save();
    }

    res.json({
      notification,
      wardName,
      collectionTime,
      message: 'Smart alert generated and saved successfully',
    });
  } catch (error) {
    console.error('Send alert error:', error.message);
    res.status(500).json({ message: 'Error generating alert' });
  }
};

// @desc    Get alerts for a ward
// @route   GET /api/alerts/:wardName
// @access  Private
const getAlerts = async (req, res) => {
  try {
    const wardName = req.params.wardName || req.user.ward;
    const ward = await Ward.findOne({ wardName });

    if (!ward) {
      return res.json({ alerts: [] });
    }

    const alerts = ward.alerts.sort((a, b) => b.createdAt - a.createdAt);
    res.json({ alerts, wardName: ward.wardName });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alerts' });
  }
};

// @desc    Get single complaint detail
// @route   GET /api/dashboard/complaints/:id
// @access  Private (municipal)
const getComplaintDetail = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizenId', 'name email ward')
      .populate('confirmations', 'name');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complaint details' });
  }
};

module.exports = {
  getWardComplaints,
  updateComplaintStatus,
  getInsights,
  sendAlert,
  getAlerts,
  getComplaintDetail,
};
