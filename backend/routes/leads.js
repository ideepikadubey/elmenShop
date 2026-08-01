const express = require('express');
const {
  createLead, getLeads, updateLeadStatus, deleteLead
} = require('../controllers/leadController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');

const router = express.Router();

// Public route to capture lead from popup
router.post('/', createLead);

// Admin Only routes
router.get('/', protect, adminOnly, getLeads);
router.put('/:id', protect, adminOnly, updateLeadStatus);
router.delete('/:id', protect, adminOnly, deleteLead);

module.exports = router;
