const express = require('express');
const {
  createEnquiry, getEnquiries, updateEnquiryStatus, deleteEnquiry
} = require('../controllers/enquiryController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');

const router = express.Router();

// Public
router.post('/', createEnquiry);

// Admin Only
router.get('/',        protect, adminOnly, getEnquiries);
router.put('/:id',    protect, adminOnly, updateEnquiryStatus);
router.delete('/:id', protect, adminOnly, deleteEnquiry);

module.exports = router;
