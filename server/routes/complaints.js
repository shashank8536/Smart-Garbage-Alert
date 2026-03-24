const express = require('express');
const router = express.Router();
const { submitComplaint, getMyComplaints, confirmPickup, upload } = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

// POST /api/complaints/submit (citizen only, with image upload)
router.post('/submit', protect, authorize('citizen'), upload.single('image'), submitComplaint);

// GET /api/complaints/my (citizen only)
router.get('/my', protect, authorize('citizen'), getMyComplaints);

// POST /api/complaints/:id/confirm (citizen only)
router.post('/:id/confirm', protect, authorize('citizen'), confirmPickup);

module.exports = router;
