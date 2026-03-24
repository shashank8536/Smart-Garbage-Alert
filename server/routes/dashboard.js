const express = require('express');
const router = express.Router();
const { getWardComplaints, updateComplaintStatus, getInsights, getComplaintDetail } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /api/dashboard/complaints (municipal only)
router.get('/complaints', protect, authorize('municipal'), getWardComplaints);

// GET /api/dashboard/complaints/:id (municipal only)
router.get('/complaints/:id', protect, authorize('municipal'), getComplaintDetail);

// PATCH /api/dashboard/complaints/:id/status (municipal only)
router.patch('/complaints/:id/status', protect, authorize('municipal'), updateComplaintStatus);

// GET /api/dashboard/insights (municipal only)
router.get('/insights', protect, authorize('municipal'), getInsights);

module.exports = router;
