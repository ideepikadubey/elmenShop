const express = require('express');
const { body } = require('express-validator');
const {
  requestRegisterOtp,
  verifyRegisterOtp,
  login,
  forgotPassword,
  resetPassword,
  resendOtp,
  getMe,
  updateMe,
  updatePassword,
  getAllUsers
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');

const router = express.Router();

// Password Regex: min 6 chars, at least 1 letter and at least 1 number
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email address is required'),
  body('password').matches(PASSWORD_REGEX).withMessage('Password must be at least 6 characters long and contain both letters and numbers'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email address is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Routes
router.post('/login',           loginValidation, login);
router.post('/register-otp',    registerValidation, requestRegisterOtp);
router.post('/register-verify',  verifyRegisterOtp);
router.post('/forgot-password',  forgotPassword);
router.post('/reset-password',   resetPassword);
router.post('/resend-otp',       resendOtp);

// User Profile Routes
router.get('/me',           protect, getMe);
router.put('/me',           protect, updateMe);
router.put('/me/password',  protect, updatePassword);

// Admin Routes
router.get('/users',        protect, adminOnly, getAllUsers);

module.exports = router;
