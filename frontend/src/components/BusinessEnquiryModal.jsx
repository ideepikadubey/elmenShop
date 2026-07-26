import React, { useState } from 'react';
import { X, Send, Building2, CheckCircle2, Phone, Mail, User } from 'lucide-react';
import axios from 'axios';

export default function BusinessEnquiryModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    isDealer: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.isDealer
          ? `[BECOME A DEALER / RETAILER] ${formData.message.trim()}`
          : formData.message.trim(),
        isDealer: formData.isDealer
      };

      await axios.post('${API_BASE_URL}/api/enquiries', payload);
      setIsSuccess(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', phone: '', message: '', isDealer: false });
    setIsSuccess(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleReset}
      style={{
        zIndex: 99999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="modal-content animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 190, 0, 0.25)',
          background: '#ffffff',
          color: '#0f172a',
          position: 'relative',
          padding: '36px 32px'
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleReset}
          aria-label="Close Business Enquiry Modal"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary-yellow)';
            e.currentTarget.style.color = '#000000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
            e.currentTarget.style.color = '#64748b';
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255, 190, 0, 0.15)', color: 'var(--primary-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, textTransform: 'uppercase', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
              Business Enquiry
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Partnership, Distribution & Bulk Supply</span>
          </div>
        </div>

        <p style={{ margin: '12px 0 20px', fontSize: '0.86rem', color: '#475569', lineHeight: 1.5 }}>
          Partner with EL MEN Nutrition. Request bulk pricing, dealership privileges, or custom supplement distribution for your gym/store.
        </p>

        {isSuccess ? (
          <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '16px', padding: '28px', textAlign: 'center', margin: '20px 0' }}>
            <div style={{ width: '50px', height: '50px', backgroundColor: '#22c55e', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <CheckCircle2 size={28} />
            </div>
            <h4 style={{ margin: '0 0 6px 0', color: '#14532d', fontSize: '1.15rem', fontWeight: 800 }}>Enquiry Submitted!</h4>
            <p style={{ margin: 0, color: '#166534', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Thank you for reaching out. Our business development team will review your enquiry and contact you within 24 business hours.
            </p>
            <button
              onClick={handleReset}
              style={{
                marginTop: '20px',
                padding: '10px 24px',
                borderRadius: '20px',
                backgroundColor: 'var(--primary-yellow)',
                color: '#000000',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Name */}
            <div>
              <label style={{ display: 'block', color: '#475569', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Full Name *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={16} style={{ position: 'absolute', left: '14px', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#0f172a',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary-yellow)'; e.target.style.background = '#ffffff'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc'; }}
                />
              </div>
            </div>

            {/* Email & Phone grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', color: '#475569', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  Email Address *
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '14px', color: '#94a3b8' }} />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '0.88rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary-yellow)'; e.target.style.background = '#ffffff'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc'; }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#475569', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  Phone Number
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '14px', color: '#94a3b8' }} />
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '0.88rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary-yellow)'; e.target.style.background = '#ffffff'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc'; }}
                  />
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label style={{ display: 'block', color: '#475569', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Requirements / Message *
              </label>
              <textarea
                rows="3"
                placeholder="Describe your bulk requirements, target delivery, business location, etc."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontSize: '0.88rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary-yellow)'; e.target.style.background = '#ffffff'; }}
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc'; }}
              />
            </div>

            {/* Become a Dealer Checkbox */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                userSelect: 'none',
                backgroundColor: formData.isDealer ? '#fffbeb' : '#f8fafc',
                border: formData.isDealer ? '1.5px solid var(--primary-yellow)' : '1.5px solid #e2e8f0',
                padding: '10px 14px',
                borderRadius: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              <input
                type="checkbox"
                checked={formData.isDealer}
                onChange={(e) => setFormData({ ...formData, isDealer: e.target.checked })}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--primary-yellow)',
                  cursor: 'pointer'
                }}
              />
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', display: 'block' }}>
                  I want to Become an Authorized Dealer / Retailer
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Unlock bulk dealer margins & priority shipment privileges
                </span>
              </div>
            </label>

            {errorMsg && (
              <div style={{ color: '#ef4444', fontSize: '0.78rem', fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'var(--primary-yellow)',
                color: '#000000',
                border: 'none',
                fontWeight: 900,
                fontSize: '0.92rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(255, 190, 0, 0.35)',
                marginTop: '4px'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-yellow-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-yellow)'; e.currentTarget.style.transform = 'none'; }}
            >
              <Send size={16} /> {isSubmitting ? 'Submitting...' : 'Submit Business Enquiry'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
