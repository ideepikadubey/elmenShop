const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  source: {
    type: String,
    default: 'WELCOME10_POPUP'
  },
  couponCode: {
    type: String,
    default: 'WELCOME10'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'converted', 'archived'],
    default: 'new'
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
