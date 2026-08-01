const jwt        = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Password Regex: Min 6 chars, at least 1 letter and at least 1 number
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;

// ── In-memory OTP stores
const registrationOtpStore   = new Map(); // email -> { name, email, phone, password, role, otp, expiresAt }
const forgotPasswordOtpStore = new Map(); // email -> { otp, expiresAt, userId }

// ── Nodemailer transporter (Gmail)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// ── Helpers ────────────────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits

const sendOtpEmail = async (email, otp, name, subtitle = 'Verification Code') => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0d0d0d;color:#fff;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#1a1a1a,#2a2a2a);padding:28px 32px;border-bottom:1px solid #333;">
        <h1 style="margin:0;font-size:1.4rem;text-transform:uppercase;letter-spacing:1px;">
          EL <span style="color:#ffbe00;">MEN</span> Nutrition
        </h1>
        <p style="margin:6px 0 0;color:#888;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;">${subtitle}</p>
      </div>
      <div style="padding:32px;">
        <p style="color:#ccc;margin:0 0 8px;">Hi <strong style="color:#fff;">${name || 'there'}</strong>,</p>
        <p style="color:#aaa;font-size:0.9rem;margin:0 0 24px;">Use the OTP below to complete your verification. It expires in <strong>10 minutes</strong>.</p>
        <div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:24px;text-align:center;margin-bottom:24px;">
          <div style="font-size:2.4rem;font-weight:900;letter-spacing:10px;color:#ffbe00;">${otp}</div>
          <div style="font-size:0.75rem;color:#666;margin-top:8px;text-transform:uppercase;letter-spacing:1px;">One-Time Password</div>
        </div>
        <p style="color:#666;font-size:0.78rem;">If you didn't request this, you can safely ignore this email. Your account is secure.</p>
      </div>
      <div style="background:#111;padding:16px 32px;text-align:center;border-top:1px solid #222;">
        <p style="margin:0;color:#555;font-size:0.72rem;">© 2025 EL MEN Nutrition · Powered by trust &amp; purity</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"EL MEN Nutrition" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${otp} — Your EL MEN Security Verification Code`,
    html,
  });
};

// ── @route  POST /api/auth/register-otp (Step 1: Request Register OTP) ───
const requestRegisterOtp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }

    const { name, email, password, phone, adminSecret } = req.body;

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long and contain both letters and numbers.'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const role = (adminSecret && adminSecret === process.env.ADMIN_SECRET) ? 'admin' : 'user';

    const otp = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

    registrationOtpStore.set(email.toLowerCase(), {
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role,
      otp,
      expiresAt
    });

    try {
      await sendOtpEmail(email, otp, name, 'Registration Account Verification');
    } catch (mailErr) {
      console.error('Registration OTP email error:', mailErr);
      return res.status(500).json({ success: false, message: 'Could not send verification OTP email. Please check server email credentials.' });
    }

    res.status(200).json({
      success: true,
      requiresOtp: true,
      email: email.toLowerCase(),
      message: `Verification OTP sent to ${email}. Please enter the OTP to complete registration.`
    });
  } catch (error) {
    console.error('Request register OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ── @route  POST /api/auth/register-verify (Step 2: Verify OTP & Create Account)
const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const record = registrationOtpStore.get(email.toLowerCase());
    if (!record) {
      return res.status(400).json({ success: false, message: 'No registration request found for this email. Please register again.' });
    }

    if (Date.now() > record.expiresAt) {
      registrationOtpStore.delete(email.toLowerCase());
      return res.status(400).json({ success: false, message: 'Verification OTP has expired. Please request a new OTP.' });
    }

    if (record.otp !== otp.toString().trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP. Please try again.' });
    }

    // Double check email uniqueness before creation
    const existing = await User.findOne({ email: record.email });
    if (existing) {
      registrationOtpStore.delete(record.email);
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Create user in DB
    const user = await User.create({
      name: record.name,
      email: record.email,
      phone: record.phone,
      password: record.password,
      role: record.role
    });

    registrationOtpStore.delete(record.email);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account verified and created successfully.',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (error) {
    console.error('Verify register OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error creating account. Please try again.' });
  }
};

// ── @route  POST /api/auth/login (Direct Password Login) ───────────────────
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ── @route  POST /api/auth/forgot-password (Step 1: Request Reset OTP) ───
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, message: 'No registered user account found with this email.' });
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

    forgotPasswordOtpStore.set(email.toLowerCase(), {
      otp,
      expiresAt,
      userId: user._id
    });

    try {
      await sendOtpEmail(email.toLowerCase(), otp, user.name, 'Password Reset Verification');
    } catch (mailErr) {
      console.error('Forgot password OTP email error:', mailErr);
      return res.status(500).json({ success: false, message: 'Could not send password reset OTP email.' });
    }

    res.json({
      success: true,
      requiresOtp: true,
      email: email.toLowerCase(),
      message: `Password reset OTP sent to ${email}. Please check your inbox.`
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ── @route  POST /api/auth/reset-password (Step 2: Reset Password with OTP)
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long and contain both letters and numbers.'
      });
    }

    const record = forgotPasswordOtpStore.get(email.toLowerCase());
    if (!record) {
      return res.status(400).json({ success: false, message: 'No password reset request found for this email. Please try again.' });
    }

    if (Date.now() > record.expiresAt) {
      forgotPasswordOtpStore.delete(email.toLowerCase());
      return res.status(400).json({ success: false, message: 'Password reset OTP has expired. Please request a new OTP.' });
    }

    if (record.otp !== otp.toString().trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP. Please try again.' });
    }

    const user = await User.findById(record.userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    user.password = newPassword;
    await user.save();

    forgotPasswordOtpStore.delete(email.toLowerCase());

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error resetting password. Please try again.' });
  }
};

// ── @route  POST /api/auth/resend-otp ────────────────────────────────────
const resendOtp = async (req, res) => {
  try {
    const { email, type } = req.body; // type = 'register' | 'forgot'
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const lowerEmail = email.toLowerCase();

    if (type === 'forgot') {
      const record = forgotPasswordOtpStore.get(lowerEmail);
      if (!record) return res.status(400).json({ success: false, message: 'No pending password reset request.' });
      const user = await User.findById(record.userId);
      const otp = generateOtp();
      forgotPasswordOtpStore.set(lowerEmail, { ...record, otp, expiresAt: Date.now() + 10 * 60 * 1000 });
      await sendOtpEmail(lowerEmail, otp, user?.name, 'Password Reset Verification');
    } else {
      const record = registrationOtpStore.get(lowerEmail);
      if (!record) return res.status(400).json({ success: false, message: 'No pending registration request.' });
      const otp = generateOtp();
      registrationOtpStore.set(lowerEmail, { ...record, otp, expiresAt: Date.now() + 10 * 60 * 1000 });
      await sendOtpEmail(lowerEmail, otp, record.name, 'Registration Account Verification');
    }

    res.json({ success: true, message: 'OTP resent successfully.' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error resending OTP.' });
  }
};

// ── @route  GET /api/auth/me ──────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address, role: user.role, createdAt: user.createdAt },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── @route  PUT /api/auth/me ──────────────────────────────────────────────
const updateMe = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, address }, { new: true, runValidators: true });
    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── @route  PUT /api/auth/me/password ────────────────────────────────────
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
    }
    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long and contain both letters and numbers.'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── @route  GET /api/auth/users ───────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching user accounts.' });
  }
};

module.exports = {
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
};
