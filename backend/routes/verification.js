const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const VerificationCode = require('../models/VerificationCode');
const { protect, admin } = require('../middleware/auth');

// Memory storage for Excel file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'text/csv' ||
      file.originalname.match(/\.(xlsx|xls|csv)$/i)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) and CSV files are allowed.'));
    }
  }
});

// ── Public Route: Verify Code ──────────────────────────────────────────
// POST /api/verification/verify
router.post('/verify', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid security scratch code.'
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    // 1. Find security code record
    const record = await VerificationCode.findOne({ code: normalizedCode });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Security code not recognized. Please check the spellings or scratch layer code on your product container.'
      });
    }

    // 2. Check single-use verification status
    if (record.isVerified) {
      const formattedDate = record.verifiedAt
        ? new Date(record.verifiedAt).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'an earlier session';

      return res.status(400).json({
        success: false,
        isAlreadyUsed: true,
        serialNum: record.serialNum,
        code: record.code,
        productName: record.productName,
        verifiedAt: record.verifiedAt,
        message: `Warning: Security Code ${record.code} (Serial #${record.serialNum}) has ALREADY been verified on ${formattedDate}. Verification codes are single-use only!`
      });
    }

    // 3. Perform atomic update to prevent duplicate simultaneous claims
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const updatedRecord = await VerificationCode.findOneAndUpdate(
      { _id: record._id, isVerified: false },
      {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedByIp: clientIp,
        $inc: { verificationCount: 1 }
      },
      { new: true }
    );

    if (!updatedRecord) {
      return res.status(400).json({
        success: false,
        isAlreadyUsed: true,
        serialNum: record.serialNum,
        code: record.code,
        message: `Warning: Security Code ${record.code} (Serial #${record.serialNum}) was just verified in another session.`
      });
    }

    return res.json({
      success: true,
      isAlreadyUsed: false,
      serialNum: updatedRecord.serialNum,
      code: updatedRecord.code,
      productName: updatedRecord.productName,
      batchNumber: updatedRecord.batchNumber,
      verifiedAt: updatedRecord.verifiedAt,
      message: `100% GENUINE PRODUCT (Serial #${updatedRecord.serialNum})`
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred during verification.'
    });
  }
});

// ── Admin Route: Upload Excel File ─────────────────────────────────────
// POST /api/verification/upload-excel
router.post('/upload-excel', protect, admin, upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please attach an Excel file (.xlsx, .xls, .csv).'
      });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!rawData || rawData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'The uploaded Excel file contains no data rows.'
      });
    }

    const operations = [];
    let validCount = 0;

    for (const row of rawData) {
      const serialNumKey = Object.keys(row).find(k => k.trim().toLowerCase().includes('serial'));
      const codeKey = Object.keys(row).find(k => k.trim().toLowerCase() === 'code' || k.trim().toLowerCase().includes('scratch'));

      const serialNum = serialNumKey ? String(row[serialNumKey]).trim() : '';
      const code = codeKey ? String(row[codeKey]).trim().toUpperCase() : '';
      const productName = row['ProductName'] || row['Product'] || 'EL MEN Authenticated Supplement';
      const batchNumber = row['BatchNumber'] || row['Batch'] || 'EL-BATCH-2026';

      if (code && serialNum) {
        operations.push({
          updateOne: {
            filter: { code: code },
            update: {
              $setOnInsert: {
                serialNum: serialNum,
                code: code,
                productName: productName,
                batchNumber: batchNumber,
                isVerified: false
              }
            },
            upsert: true
          }
        });
        validCount++;
      }
    }

    if (operations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid rows containing SerialNum and Code were found in the file.'
      });
    }

    const result = await VerificationCode.bulkWrite(operations);
    const addedCount = result.upsertedCount || 0;

    return res.json({
      success: true,
      message: `Successfully processed ${validCount} rows (${addedCount} new codes added).`,
      addedCount,
      totalProcessed: validCount
    });
  } catch (error) {
    console.error('Error processing Excel upload:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process Excel upload.'
    });
  }
});

// ── Admin Route: Verification Code Stats ────────────────────────────────
// GET /api/verification/stats
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalCount = await VerificationCode.countDocuments();
    const verifiedCount = await VerificationCode.countDocuments({ isVerified: true });
    const unverifiedCount = totalCount - verifiedCount;

    const recentVerifications = await VerificationCode.find({ isVerified: true })
      .sort({ verifiedAt: -1 })
      .limit(10)
      .select('serialNum code productName verifiedAt verifiedByIp');

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
    console.error('Error fetching verification stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch verification statistics.'
    });
  }
});

module.exports = router;
