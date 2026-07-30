const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema({
  serialNum: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  productName: {
    type: String,
    default: 'EL MEN Authenticated Supplement'
  },
  batchNumber: {
    type: String,
    default: 'EL-BATCH-2026'
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
    default: null
  },
  verificationCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Compound index for quick serialNum + code queries
verificationCodeSchema.index({ serialNum: 1, code: 1 });

module.exports = mongoose.model('VerificationCode', verificationCodeSchema);
