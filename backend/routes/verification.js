const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const VerificationCode = require('../models/VerificationCode');

// Configure Multer for Excel file upload in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.includes('excel') ||
      file.mimetype.includes('spreadsheetml') ||
      file.mimetype.includes('csv') ||
      file.originalname.match(/\.(xlsx|xls|csv)$/i)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed.'), false);
    }
  }
});

// ── 1. PUBLIC VERIFY ENDPOINT ──────────────────────────────────────
// POST /api/verification/verify
router.post('/verify', async (req, res) => {
  try {
    const { code, serialNum } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid security scratch code.'
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanSerial = serialNum ? serialNum.trim() : '';

    // Search query: match code, and optionally serialNum if provided
    let query = { code: cleanCode };
    if (cleanSerial) {
      query.serialNum = cleanSerial;
    }

    let record = await VerificationCode.findOne(query);

    // If query with both code & serialNum fails, fallback to code alone to check if code exists with a different serial
    if (!record && cleanSerial) {
      record = await VerificationCode.findOne({ code: cleanCode });
      if (record && record.serialNum !== cleanSerial) {
        return res.status(400).json({
          success: false,
          message: `The security code "${cleanCode}" does not match Serial #${cleanSerial}. Please verify the serial number on your product.`
        });
      }
    }

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Security code not recognized in our database. Please double-check your product label scratch code.'
      });
    }

    // Single-use Check: If already verified, reject duplicate authentication
    if (record.isVerified) {
      const formattedDate = record.verifiedAt
        ? new Date(record.verifiedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        : 'an earlier date';

      return res.status(400).json({
        success: false,
        isAlreadyUsed: true,
        message: `⚠️ Security code "${record.code}" (Serial #${record.serialNum}) was ALREADY verified on ${formattedDate}. Single-use scratch codes cannot be authenticated more than once!`,
        record: {
          serialNum: record.serialNum,
          code: record.code,
          verifiedAt: record.verifiedAt
        }
      });
    }

    // First time verification: Mark as verified atomically
    record.isVerified = true;
    record.verifiedAt = new Date();
    record.verifiedByIp = req.ip || req.headers['x-forwarded-for'] || 'client';
    record.verificationCount = (record.verificationCount || 0) + 1;
    await record.save();

    return res.status(200).json({
      success: true,
      message: '🎉 100% Genuine Product Verified!',
      record: {
        serialNum: record.serialNum,
        code: record.code,
        verifiedAt: record.verifiedAt
      }
    });

  } catch (error) {
    console.error('Verification API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during verification. Please try again.'
    });
  }
});

// ── 2. ADMIN EXCEL UPLOAD ENDPOINT ─────────────────────────────────
// POST /api/verification/upload-excel
router.post('/upload-excel', upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No Excel file provided.' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ success: false, message: 'Uploaded Excel sheet contains no data rows.' });
    }

    const bulkOps = [];
    let skippedCount = 0;

    for (const row of rawRows) {
      // Flexible column key matching
      const serialKey = Object.keys(row).find(k => k.trim().toLowerCase().includes('serial')) || Object.keys(row)[0];
      const codeKey = Object.keys(row).find(k => k.trim().toLowerCase().includes('code')) || Object.keys(row)[1];

      const serialVal = String(row[serialKey] || '').trim();
      const codeVal = String(row[codeKey] || '').trim().toUpperCase();

      if (serialVal && codeVal) {
        bulkOps.push({
          updateOne: {
            filter: { code: codeVal },
            update: {
              $setOnInsert: {
                serialNum: serialVal,
                code: codeVal,
                isVerified: false,
                verifiedAt: null,
                verifiedByIp: '',
                verificationCount: 0
              }
            },
            upsert: true
          }
        });
      } else {
        skippedCount++;
      }
    }

    if (bulkOps.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not find valid SerialNum and Code columns in the Excel file.'
      });
    }

    const bulkResult = await VerificationCode.bulkWrite(bulkOps);

    return res.json({
      success: true,
      message: `Excel processed successfully! Inserted ${bulkResult.upsertedCount} new verification codes (${skippedCount} skipped/empty).`,
      totalProcessed: bulkOps.length,
      newInserted: bulkResult.upsertedCount,
      matchedExisting: bulkResult.matchedCount
    });

  } catch (error) {
    console.error('Excel upload error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process Excel upload file.'
    });
  }
});

// ── 3. ADMIN STATS ENDPOINT ────────────────────────────────────────
// GET /api/verification/stats
router.get('/stats', async (req, res) => {
  try {
    const totalCount = await VerificationCode.countDocuments({});
    const verifiedCount = await VerificationCode.countDocuments({ isVerified: true });
    const unverifiedCount = await VerificationCode.countDocuments({ isVerified: false });
    const recentVerifications = await VerificationCode.find({ isVerified: true })
      .sort({ verifiedAt: -1 })
      .limit(10)
      .select('serialNum code verifiedAt verifiedByIp');

    return res.json({
      success: true,
      stats: {
        totalCount,
        verifiedCount,
        unverifiedCount,
        recentVerifications
      }
    });
  } catch (error) {
    console.error('Verification stats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch verification statistics.' });
  }
});

module.exports = router;
