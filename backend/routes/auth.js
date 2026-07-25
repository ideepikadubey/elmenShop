const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  verifyOtp,
  resendOtp,
  getMe,
  updateMe,
  updatePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Routes
router.post('/register',    registerValidation, register);
router.post('/login',       loginValidation,    login);
router.post('/verify-otp',  verifyOtp);
router.post('/resend-otp',  resendOtp);
router.get('/me',           protect, getMe);
router.put('/me',           protect, updateMe);
router.put('/me/password',  protect, updatePassword);

module.exports = router;
