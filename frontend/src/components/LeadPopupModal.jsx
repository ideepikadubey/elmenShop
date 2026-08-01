import React, { useState, useEffect } from 'react';
import { X, Sparkles, Phone, Check, ArrowRight, Copy } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from "../config/api";

export default function LeadPopupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState({
    code: 'WELCOME10',
    discountValue: '10%',
    title: '10% OFF'
  });

  // Fetch active promotional coupon from backend database
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/offers`)
      .then(res => {
        if (res.data.success && Array.isArray(res.data.offers) && res.data.offers.length > 0) {
          const now = Date.now();
          const valid = res.data.offers.find(o => o.isActive !== false && new Date(o.endDate).getTime() > now);
          if (valid) {
            setActiveCoupon({
              code: valid.code,
              discountValue: valid.discountType === 'percentage' ? `${valid.discountValue}%` : `₹${valid.discountValue}`,
              title: valid.title || `${valid.discountValue}% OFF`
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCoupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    // Check if user has already seen or closed the popup in this session
    const hasSeen = sessionStorage.getItem('elmen_lead_popup_seen');
    let timer;
    if (!hasSeen) {
      timer = setTimeout(() => {
        setIsOpen(true);
      }, 10000); // 10 seconds delay after visiting
    }

    const customHandler = () => setIsOpen(true);
    window.addEventListener('elmen:openLeadPopup', customHandler);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('elmen:openLeadPopup', customHandler);
    };
  }, []);

  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsOpen(false);
    try {
      sessionStorage.setItem('elmen_lead_popup_seen', 'true');
    } catch (err) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Send lead to backend API
      await axios.post(`${API_BASE_URL}/api/leads`, {
        phone: cleanPhone,
        source: 'WELCOME_POPUP',
        couponCode: activeCoupon.code
      }).catch((err) => {
        console.warn('Lead submit fallback:', err);
      });

      setIsSuccess(true);
      sessionStorage.setItem('elmen_lead_popup_seen', 'true');
    } catch (err) {
      console.error('Lead popup error:', err);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose(e);
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '960px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          display: 'grid',
          gridTemplateColumns: '1.25fr 1fr',
          border: '1px solid rgba(255, 190, 0, 0.3)'
        }}
        className="lead-popup-container"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleClose(e); }}
          onTouchStart={(e) => { e.stopPropagation(); handleClose(e); }}
          aria-label="Close popup"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 100,
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            pointerEvents: 'auto'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary-yellow)';
            e.currentTarget.style.color = '#000000';
            e.currentTarget.style.transform = 'rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0f172a';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* Left Side: Uncropped Poster Image */}
        <div
          style={{
            position: 'relative',
            backgroundColor: '#050505',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '320px',
            overflow: 'hidden',
            padding: '8px'
          }}
          className="lead-popup-image-col"
        >
          <img
            src="/popup.png"
            alt="Exclusive Offer"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block'
            }}
          />
        </div>

        {/* Right Side: Form Content */}
        <div
          style={{
            padding: '36px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: '#ffffff'
          }}
        >
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '20px', padding: '4px 12px', width: 'fit-content', marginBottom: '14px' }}>
            <Sparkles size={14} style={{ color: '#d97706' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              VIP EXCLUSIVE OFFER
            </span>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
            Get <span style={{ color: '#d97706' }}>10% OFF</span> Your Order!
          </h2>

          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 20px 0', lineHeight: 1.5 }}>
            Enter your mobile number to unlock instant VIP discount coupons and exclusive wellness deals.
          </p>

          {isSuccess ? (
            <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '16px', padding: '20px 16px', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#22c55e', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)' }}>
                <Check size={26} strokeWidth={3} />
              </div>

              <h4 style={{ margin: '0 0 6px 0', color: '#14532d', fontSize: '1.1rem', fontWeight: 900 }}>
                🎉 VIP OFFER UNLOCKED!
              </h4>
              <p style={{ margin: '0 0 16px 0', color: '#166534', fontSize: '0.82rem', lineHeight: 1.4 }}>
                Your 10% OFF discount coupon code is ready. Use it at checkout to claim your savings!
              </p>

              {/* Coupon Box with Copy Button */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '2px dashed #22c55e',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                marginBottom: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}>
                    ACTIVE COUPON CODE
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', letterSpacing: '1px', fontFamily: 'monospace' }}>
                    {activeCoupon.code}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  style={{
                    backgroundColor: copied ? '#22c55e' : '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 16px',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    textTransform: 'uppercase'
                  }}
                >
                  {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy Code</>}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Mobile Number
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', left: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontWeight: 700, fontSize: '0.88rem', pointerEvents: 'none' }}>
                    <Phone size={16} />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 68px',
                      borderRadius: '12px',
                      border: errorMsg ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      outline: 'none',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-yellow)'}
                    onBlur={(e) => e.target.style.borderColor = errorMsg ? '#ef4444' : '#cbd5e1'}
                  />
                </div>
                {errorMsg && (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, marginTop: '4px', display: 'block' }}>
                    {errorMsg}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--primary-yellow)',
                  color: '#000000',
                  border: 'none',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(255, 190, 0, 0.35)',
                  transition: 'all 0.2s ease',
                  marginTop: '4px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-yellow-hover)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-yellow)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {isSubmitting ? 'Unlocking Offer...' : (
                  <>
                    Claim 10% OFF Now <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          <span style={{ fontSize: '0.68rem', color: '#94a3b8', textAlign: 'center', marginTop: '16px', display: 'block' }}>
            🔒 We respect your privacy. No spam guaranteed.
          </span>
        </div>
      </div>
    </div>
  );
}
