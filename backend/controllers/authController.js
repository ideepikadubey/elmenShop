const jwt        = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// ── In-memory OTP store: { email -> { otp, expiresAt, userId } }
const otpStore = new Map();

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

const sendOtpEmail = async (email, otp, name) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0d0d0d;color:#fff;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#1a1a1a,#2a2a2a);padding:28px 32px;border-bottom:1px solid #333;">
        <h1 style="margin:0;font-size:1.4rem;text-transform:uppercase;letter-spacing:1px;">
          EL <span style="color:#ffbe00;">MEN</span> Nutrition
        </h1>
        <p style="margin:6px 0 0;color:#888;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;">Secure Login Verification</p>
      </div>
      <div style="padding:32px;">
        <p style="color:#ccc;margin:0 0 8px;">Hi <strong style="color:#fff;">${name || 'there'}</strong>,</p>
        <p style="color:#aaa;font-size:0.9rem;margin:0 0 24px;">Use the OTP below to complete your login. It expires in <strong>10 minutes</strong>.</p>
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
    subject: `${otp} — Your EL MEN Login OTP`,
    html,
  });
};

// ── @route  POST /api/auth/register ───────────────────────────────────────
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    const { name, email, password, phone, adminSecret } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });

    const role =
      adminSecret && adminSecret === process.env.ADMIN_SECRET ? 'admin' : 'user';

    const user  = await User.create({ name, email, password, phone, role });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ── @route  POST /api/auth/login ──────────────────────────────────────────
// Step 1: validate credentials → send OTP → return { requiresOtp: true }
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    // Generate & store OTP
    const otp       = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore.set(email, { otp, expiresAt, userId: user._id });

    // Send email
    try {
      await sendOtpEmail(email, otp, user.name);
    } catch (mailErr) {
      console.error('OTP email failed:', mailErr.message);
      return res.status(500).json({ success: false, message: 'Could not send OTP email. Check EMAIL_USER/EMAIL_PASS in .env.' });
    }

    res.json({
      success:    true,
      requiresOtp: true,
      message:    `OTP sent to ${email}. Check your inbox.`,
      email,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ── @route  POST /api/auth/verify-otp ────────────────────────────────────
// Step 2: verify OTP → issue JWT
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });

    const record = otpStore.get(email);

    if (!record)
      return res.status(400).json({ success: false, message: 'No OTP was requested for this email. Please login again.' });

    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please login again.' });
    }

    if (record.otp !== otp.toString().trim())
      return res.status(400).json({ success: false, message: 'Incorrect OTP. Please try again.' });

    // OTP valid — clear it and issue token
    otpStore.delete(email);

    const user  = await User.findById(record.userId);
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id:      user._id,
        name:    user.name,
        email:   user.email,
        phone:   user.phone,
        address: user.address,
        role:    user.role,
      },
    });
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ── @route  POST /api/auth/resend-otp ────────────────────────────────────
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: 'Email is required.' });

    const existing = otpStore.get(email);
    if (!existing)
      return res.status(400).json({ success: false, message: 'No pending login session. Please login again.' });

    const otp       = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    otpStore.set(email, { ...existing, otp, expiresAt });

    const user = await User.findById(existing.userId);
    await sendOtpEmail(email, otp, user?.name);

    res.json({ success: true, message: 'OTP resent successfully.' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
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
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });

    const user    = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch)
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { register, login, verifyOtp, resendOtp, getMe, updateMe, updatePassword };
