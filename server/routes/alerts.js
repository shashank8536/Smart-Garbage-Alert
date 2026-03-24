const express = require('express');
const router = express.Router();
const { sendAlert, getAlerts } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

// POST /api/alerts/send (municipal only)
router.post('/send', protect, authorize('municipal'), sendAlert);

// GET /api/alerts/:wardName (any authenticated user)
router.get('/:wardName', protect, getAlerts);

module.exports = router;
