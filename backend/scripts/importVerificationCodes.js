require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const connectDB = require('../config/db');
const VerificationCode = require('../models/VerificationCode');

async function importCodesFromExcel(filePath) {
  try {
    console.log(`\n📂 Reading Excel file: ${filePath}`);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found at path: ${filePath}`);
      process.exit(1);
    }

    await connectDB();

    const workbook = XLSX.readFile(filePath);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!rawData || rawData.length === 0) {
      console.error('❌ No data rows found in the Excel sheet.');
      process.exit(1);
    }

    console.log(`📊 Found ${rawData.length} rows in sheet "${firstSheetName}".`);

    const operations = [];
    let validCount = 0;

    for (const row of rawData) {
      // Flexibly find SerialNum and Code columns regardless of capitalization or spacing
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
      console.error('❌ No valid row containing both SerialNum and Code found.');
      process.exit(1);
    }

    console.log(`⏳ Executing bulk import for ${operations.length} codes...`);
    const result = await VerificationCode.bulkWrite(operations);

    console.log(`\n✅ Import Completed Successfully!`);
    console.log(`   - Total Inserted: ${result.upsertedCount || 0}`);
    console.log(`   - Existing Skipped: ${validCount - (result.upsertedCount || 0)}`);
    console.log(`   - Total Processed: ${validCount}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to import verification codes:', error);
    process.exit(1);
  }
}

const targetFilePath = process.argv[2];
if (!targetFilePath) {
  console.log('Usage: node scripts/importVerificationCodes.js <path-to-excel-file>');
  process.exit(1);
}

importCodesFromExcel(targetFilePath);
