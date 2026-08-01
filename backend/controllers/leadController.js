const Lead = require('../models/Lead');

// @desc    Submit a new lead from popup modal
// @route   POST /api/leads
// @access  Public
exports.createLead = async (req, res) => {
  try {
    const { phone, source, couponCode } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number.' });
    }

    // Check if lead already exists; if so, update timestamp and source
    let lead = await Lead.findOne({ phone: cleanPhone });
    if (lead) {
      lead.updatedAt = Date.now();
      if (source) lead.source = source;
      await lead.save();
      return res.status(200).json({ success: true, message: 'Lead updated successfully.', lead });
    }

    lead = await Lead.create({
      phone: cleanPhone,
      source: source || 'WELCOME10_POPUP',
      couponCode: couponCode || 'WELCOME10'
    });

    res.status(201).json({ success: true, message: 'Lead submitted successfully.', lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private/Admin
exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: leads.length, leads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update lead status / notes
// @route   PUT /api/leads/:id
// @access  Private/Admin
exports.updateLeadStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const lead = await Lead.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    res.status(200).json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private/Admin
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }
    res.status(200).json({ success: true, message: 'Lead deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
