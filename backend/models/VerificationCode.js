const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema({
  serialNum: {
    type: String,
    required: [true, 'Serial number is required'],
    trim: true,
    index: true
  },
  code: {
    type: String,
    required: [true, 'Verification code is required'],
    trim: true,
    uppercase: true,
    unique: true,
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  verifiedByIp: {
    type: String,
    default: ''
  },
  verificationCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('VerificationCode', verificationCodeSchema);
