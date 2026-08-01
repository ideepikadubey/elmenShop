const Offer = require('../models/Offer');

// @desc    Create a new promotion/offer
// @route   POST /api/offers
// @access  Private/Admin
exports.createOffer = async (req, res) => {
  try {
    const { title, description, code, discountType, discountValue, targetProducts, startDate, endDate } = req.body;
    
    if (!title || !code || discountValue === undefined || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Required fields missing: title, code, discountValue, startDate, endDate' });
    }

    // Check if code already exists
    const codeExists = await Offer.findOne({ code: code.toUpperCase() });
    if (codeExists) {
      return res.status(400).json({ success: false, message: `Offer code "${code.toUpperCase()}" already exists.` });
    }

    const offer = await Offer.create({
      title,
      description,
      code: code.toUpperCase(),
      discountType,
      discountValue,
      targetProducts: targetProducts || [],
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });

    res.status(201).json({ success: true, offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all offers (Admins get all, public gets active ones)
// @route   GET /api/offers
// @access  Public / Private/Admin
exports.getOffers = async (req, res) => {
  try {
    // If the request has authorization and role is admin, show all. Otherwise, only show active.
    let query = {};
    if (req.user && req.user.role === 'admin') {
      query = {};
    } else {
      const now = new Date();
      // Allow timezone buffer (+24 hours) for start date so offers created for today are immediately active
      const startDateMax = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      query = {
        isActive: true,
        startDate: { $lte: startDateMax },
        endDate: { $gte: now }
      };
    }

    const offers = await Offer.find(query).populate('targetProducts', 'name price').sort({ createdAt: -1 });
    res.status(200).json({ success: true, offers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update offer status (isActive toggle)
// @route   PUT /api/offers/:id
// @access  Private/Admin
exports.updateOfferStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (isActive === undefined) {
      return res.status(400).json({ success: false, message: 'isActive field is required.' });
    }

    const offer = await Offer.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    res.status(200).json({ success: true, offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an offer
// @route   DELETE /api/offers/:id
// @access  Private/Admin
exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }
    res.status(200).json({ success: true, message: 'Offer deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate a coupon code and return discount info
// @route   POST /api/offers/validate
// @access  Public
exports.validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code is required.' });

    const now = new Date();
    const startDateMax = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const offer = await Offer.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
      startDate: { $lte: startDateMax },
      endDate:   { $gte: now }
    });

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
    }

    res.json({
      success: true,
      offer: {
        _id:           offer._id,
        code:          offer.code,
        title:         offer.title,
        description:   offer.description,
        discountType:  offer.discountType,   // 'percentage' | 'flat'
        discountValue: offer.discountValue,  // e.g. 30 (means 30% or ₹30 flat)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
