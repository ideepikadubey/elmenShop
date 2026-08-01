const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  createOffer, getOffers, updateOfferStatus, updateOffer, deleteOffer, validateCoupon
} = require('../controllers/offerController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');

const router = express.Router();

// Optional authentication middleware for GET /api/offers
const optionalProtect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next(); // Ignore error and proceed as unauthenticated public user
  }
};

// Routes
router.get('/',         optionalProtect, getOffers);
router.post('/validate', validateCoupon);

// Admin Only
router.post('/',          protect, adminOnly, createOffer);
router.put('/:id/details', protect, adminOnly, updateOffer);
router.put('/:id',        protect, adminOnly, updateOfferStatus);
router.delete('/:id',     protect, adminOnly, deleteOffer);

module.exports = router;
