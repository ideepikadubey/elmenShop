import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { X, Lock, Mail, User, Phone, CheckCircle2, ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function AuthModal({ onClose, onAuthSuccess, promptMessage }) {
  const [tab, setTab] = useState(promptMessage ? 'register' : 'login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // OTP flow state
  const [otpStep, setOtpStep] = useState(false);   // true = show OTP screen
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Auto-focus first OTP box when step appears
  useEffect(() => {
    if (otpStep) {
      setTimeout(() => otpRefs[0].current?.focus(), 100);
      setResendCooldown(30);
    }
  }, [otpStep]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ── OTP digit input handler ─────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && index < 5) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(''));
      otpRefs[5].current?.focus();
    }
    e.preventDefault();
  };

  // ── Validation ──────────────────────────────────────────────────────────
  const validateLogin = () => {
    const newErrors = {};
    if (!loginData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(loginData.email)) newErrors.email = 'Invalid email';
    if (!loginData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const newErrors = {};
    if (!registerData.name.trim()) newErrors.name = 'Full name is required';
    if (!registerData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(registerData.email)) newErrors.email = 'Invalid email';
    if (!registerData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(registerData.phone.trim())) newErrors.phone = 'Enter a 10-digit number';
    if (!registerData.password) newErrors.password = 'Password is required';
    else if (registerData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Step 1: Submit login credentials → trigger OTP ──────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setIsSubmitting(true);
    setErrors({});
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, loginData);
      const data = response.data;

      if (data.requiresOtp) {
        setPendingEmail(data.email);
        setOtpDigits(['', '', '', '', '', '']);
        setOtpStep(true);
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Login failed. Please check credentials.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 2: Verify OTP ───────────────────────────────────────────────────
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length < 6) {
      setErrors({ otp: 'Please enter all 6 digits.' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
        email: pendingEmail,
        otp,
      });
      const data = response.data;
      localStorage.setItem('elmen_token', data.token);
      if (data.user) localStorage.setItem('elmen_user', JSON.stringify(data.user));
      setSuccessMessage('Logged in successfully!');
      setTimeout(() => {
        setIsSubmitting(false);
        onAuthSuccess(data.user);
        onClose();
      }, 1200);
    } catch (error) {
      setIsSubmitting(false);
      setErrors({ otp: error.response?.data?.message || 'Invalid OTP. Please try again.' });
    }
  };

  // ── Resend OTP ───────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      await axios.post(`${API_BASE_URL}/api/auth/resend-otp`, { email: pendingEmail });
      setOtpDigits(['', '', '', '', '', '']);
      setResendCooldown(30);
      otpRefs[0].current?.focus();
    } catch (error) {
      setErrors({ otp: error.response?.data?.message || 'Failed to resend OTP.' });
    }
  };

  // ── Register ─────────────────────────────────────────────────────────────
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;

    setIsSubmitting(true);
    setErrors({});
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name: registerData.name,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password,
      });
      const data = response.data;
      localStorage.setItem('elmen_token', data.token);
      if (data.user) localStorage.setItem('elmen_user', JSON.stringify(data.user));
      setSuccessMessage('Account created successfully!');
      setTimeout(() => {
        setIsSubmitting(false);
        onAuthSuccess(data.user);
        onClose();
      }, 1000);
    } catch (error) {
      setIsSubmitting(false);
      setErrors({ submit: error.response?.data?.message || 'Registration failed.' });
    }
  };

  // ── Shared styles ────────────────────────────────────────────────────────
  const inputIconStyle = { position: 'absolute', left: '14px', top: '15px', color: '#64748b' };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div
        className="modal-content animate-fade-in"
        style={{
          maxWidth: '450px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 0,
          borderRadius: '24px',
          background: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 30px 60px rgba(15, 23, 42, 0.15)',
          color: '#1e293b',
          fontFamily: '"Outfit", "Inter", sans-serif'
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Success Screen ── */}
        {successMessage ? (
          <div style={{ padding: '60px 40px', background: '#ffffff', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.12)'
            }}>
              <CheckCircle2 size={40} style={{ color: '#22c55e' }} />
            </div>
            <h3 style={{ textTransform: 'uppercase', fontWeight: 900, margin: 0, color: '#0f172a', fontSize: '1.2rem', letterSpacing: '0.25px' }}>{successMessage}</h3>
            <p style={{ color: '#64748b', margin: 0, fontWeight: 500 }}>Welcome back to EL MEN Nutrition!</p>
          </div>

          /* ── OTP Verification Screen ── */
        ) : otpStep ? (
          <div>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', padding: '28px 32px 20px', borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
              <button
                onClick={() => { setOtpStep(false); setErrors({}); }}
                style={{
                  position: 'absolute', top: '20px', left: '20px',
                  background: '#f1f5f9', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', color: '#475569',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={onClose}
                style={{
                  position: 'absolute', top: '20px', right: '20px',
                  background: '#f1f5f9', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', color: '#475569',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
              >
                <X size={16} />
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', paddingTop: '12px' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fef9c3 0%, #fef3c7 100%)',
                  border: '1px solid #fde68a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.12)'
                }}>
                  <ShieldCheck size={26} style={{ color: '#d97706' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', margin: 0, color: '#0f172a', letterSpacing: '0.25px' }}>Verify Your Identity</h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '6px 0 0', fontWeight: 500 }}>
                    OTP sent to <strong style={{ color: '#0f172a' }}>{pendingEmail}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <form onSubmit={handleOtpSubmit} style={{ padding: '28px 32px 32px', background: '#ffffff' }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', marginBottom: '24px', lineHeight: 1.6, fontWeight: 500 }}>
                Enter the 6-digit code we sent to your email. It's valid for <strong style={{ color: '#b45309' }}>10 minutes</strong>.
              </p>

              {/* 6-box OTP input */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }} onPaste={handleOtpPaste}>
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={otpRefs[i]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    style={{
                      width: '48px', height: '56px',
                      textAlign: 'center', fontSize: '1.6rem', fontWeight: 900,
                      borderRadius: '12px', border: `2px solid ${digit ? '#eab308' : '#cbd5e1'}`,
                      background: digit ? 'rgba(251, 191, 36, 0.05)' : '#f8fafc',
                      color: '#0f172a', outline: 'none', transition: 'all 0.2s',
                      caretColor: '#eab308',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#eab308'; e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.12)'; }}
                    onBlur={(e) => { e.target.style.borderColor = e.target.value ? '#eab308' : '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                  />
                ))}
              </div>

              {errors.otp && (
                <div style={{ color: '#991b1b', fontSize: '0.85rem', textAlign: 'center', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px', marginBottom: '20px', fontWeight: 500 }}>
                  {errors.otp}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%', marginBottom: '16px', padding: '14px 20px', borderRadius: '30px', fontWeight: 800, textTransform: 'uppercase',
                  boxShadow: '0 4px 10px rgba(234, 179, 8, 0.2)', border: 'none', cursor: 'pointer', backgroundColor: '#eab308', color: '#0f172a'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ca8a04'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#eab308'}
                disabled={isSubmitting || otpDigits.some(d => !d)}
              >
                {isSubmitting ? 'Verifying…' : 'Verify & Sign In'}
              </button>

              {/* Resend */}
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0}
                  style={{
                    background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    color: resendCooldown > 0 ? '#94a3b8' : '#d97706',
                    fontSize: '0.85rem', fontWeight: 800, padding: '6px 12px', borderRadius: '6px',
                    transition: 'color 0.2s'
                  }}
                >
                  <RefreshCw size={14} style={{ animation: resendCooldown === 0 ? 'none' : 'spin 2s linear infinite' }} />
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          </div>

          /* ── Login / Register Forms ── */
        ) : (
          <div style={{ background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 20px 0' }}>
              <button
                onClick={onClose}
                aria-label="Close"
                style={{
                  background: '#f1f5f9', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', color: '#475569',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '0 32px 32px', background: '#ffffff' }}>
              {promptMessage && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: '#fffbeb',
                  border: '1.5px solid #fde68a',
                  borderRadius: '16px',
                  padding: '14px 18px',
                  marginBottom: '24px'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>🛒</span>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#92400e', fontWeight: 800, lineHeight: 1.4 }}>{promptMessage}</p>
                </div>
              )}

              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', marginBottom: '28px' }}>
                {['login', 'register'].map((t) => (
                  <button
                    key={t}
                    style={{
                      flex: 1, border: 'none', background: 'none', padding: '14px',
                      fontWeight: 900, cursor: 'pointer', fontSize: '0.9rem', textTransform: 'uppercase',
                      color: tab === t ? '#d97706' : '#64748b',
                      borderBottom: tab === t ? '3px solid #eab308' : '3px solid transparent',
                      transition: 'all 0.2s',
                      letterSpacing: '0.5px'
                    }}
                    onClick={() => { setTab(t); setErrors({}); }}
                  >
                    {t === 'login' ? 'Login' : 'Register'}
                  </button>
                ))}
              </div>

              {tab === 'login' ? (
                <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="form-group">
                    <label style={{ color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.75px', display: 'block', marginBottom: '8px' }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={inputIconStyle} />
                      <input
                        type="email"
                        name="email"
                        placeholder="yourname@gmail.com"
                        className="form-input"
                        style={{ paddingLeft: '44px', paddingRight: '20px', height: '48px', background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#0f172a', outline: 'none', borderRadius: '12px', width: '100%', fontSize: '0.9rem', fontWeight: 500 }}
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.email && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500, display: 'block', marginTop: '4px' }}>{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label style={{ color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.75px', display: 'block', marginBottom: '8px' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={inputIconStyle} />
                      <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        className="form-input"
                        style={{ paddingLeft: '44px', paddingRight: '20px', height: '48px', background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#0f172a', outline: 'none', borderRadius: '12px', width: '100%', fontSize: '0.9rem', fontWeight: 500 }}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.password && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500, display: 'block', marginTop: '4px' }}>{errors.password}</span>}
                  </div>

                  {errors.submit && (
                    <div style={{ color: '#991b1b', fontSize: '0.85rem', textAlign: 'center', background: '#fef2f2', padding: '12px', borderRadius: '12px', border: '1px solid #fecaca', fontWeight: 500 }}>
                      {errors.submit}
                    </div>
                  )}

                  <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', margin: 0, fontWeight: 500 }}>
                    🔒 An OTP verification link will be sent to your email to complete login.
                  </p>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      width: '100%', padding: '14px 20px', borderRadius: '30px', fontWeight: 800, textTransform: 'uppercase',
                      boxShadow: '0 4px 10px rgba(234, 179, 8, 0.2)', border: 'none', cursor: 'pointer', backgroundColor: '#eab308', color: '#0f172a'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ca8a04'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#eab308'}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending OTP…' : 'Send OTP & Sign In'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="form-group">
                    <label style={{ color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.75px', display: 'block', marginBottom: '8px' }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={inputIconStyle} />
                      <input
                        type="text"
                        name="name"
                        placeholder="Alex Johnson"
                        className="form-input"
                        style={{ paddingLeft: '44px', paddingRight: '20px', height: '48px', background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#0f172a', outline: 'none', borderRadius: '12px', width: '100%', fontSize: '0.9rem', fontWeight: 500 }}
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.name && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500, display: 'block', marginTop: '4px' }}>{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label style={{ color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.75px', display: 'block', marginBottom: '8px' }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={inputIconStyle} />
                      <input
                        type="email"
                        name="email"
                        placeholder="alex@gmail.com"
                        className="form-input"
                        style={{ paddingLeft: '44px', paddingRight: '20px', height: '48px', background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#0f172a', outline: 'none', borderRadius: '12px', width: '100%', fontSize: '0.9rem', fontWeight: 500 }}
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.email && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500, display: 'block', marginTop: '4px' }}>{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label style={{ color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.75px', display: 'block', marginBottom: '8px' }}>Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} style={inputIconStyle} />
                      <input
                        type="text"
                        name="phone"
                        placeholder="9876543210"
                        className="form-input"
                        style={{ paddingLeft: '44px', paddingRight: '20px', height: '48px', background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#0f172a', outline: 'none', borderRadius: '12px', width: '100%', fontSize: '0.9rem', fontWeight: 500 }}
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.phone && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500, display: 'block', marginTop: '4px' }}>{errors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label style={{ color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.75px', display: 'block', marginBottom: '8px' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={inputIconStyle} />
                      <input
                        type="password"
                        name="password"
                        placeholder="Min 6 characters"
                        className="form-input"
                        style={{ paddingLeft: '44px', paddingRight: '20px', height: '48px', background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#0f172a', outline: 'none', borderRadius: '12px', width: '100%', fontSize: '0.9rem', fontWeight: 500 }}
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.password && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500, display: 'block', marginTop: '4px' }}>{errors.password}</span>}
                  </div>

                  {errors.submit && (
                    <div style={{ color: '#991b1b', fontSize: '0.85rem', textAlign: 'center', background: '#fef2f2', padding: '12px', borderRadius: '12px', border: '1px solid #fecaca', fontWeight: 500 }}>
                      {errors.submit}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      width: '100%', padding: '14px 20px', borderRadius: '30px', fontWeight: 800, textTransform: 'uppercase',
                      boxShadow: '0 4px 10px rgba(234, 179, 8, 0.2)', border: 'none', cursor: 'pointer', backgroundColor: '#eab308', color: '#0f172a'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ca8a04'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#eab308'}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating account…' : 'Create Account'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
