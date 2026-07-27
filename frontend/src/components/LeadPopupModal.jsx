import React, { useState, useEffect } from 'react';
import { X, Sparkles, Phone, Check, ArrowRight } from 'lucide-react';
import axios from 'axios';

export default function LeadPopupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Check if user has already seen or closed the popup in this session
    const hasSeen = sessionStorage.getItem('elmen_lead_popup_seen');
    let timer;
    if (!hasSeen) {
      timer = setTimeout(() => {
        setIsOpen(true);
      }, 2500); // 2.5 seconds delay after visiting
    }

    const customHandler = () => setIsOpen(true);
    window.addEventListener('elmen:openLeadPopup', customHandler);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('elmen:openLeadPopup', customHandler);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('elmen_lead_popup_seen', 'true');
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
      // Send lead to backend API or WhatsApp redirect
      await axios.post(`${API_BASE_URL}/api/offers`, {
        code: 'WELCOME10',
        title: `Popup Lead: ${cleanPhone}`,
        discountType: 'percentage',
        discountValue: 10
      }).catch(() => { }); // Fallback silently if route varies

      setIsSuccess(true);
      sessionStorage.setItem('elmen_lead_popup_seen', 'true');

      setTimeout(() => {
        // Open WhatsApp with welcome offer
        window.open(`https://wa.me/91${cleanPhone}?text=Hi%20EL%20MEN%20Nutrition%2C%20I%20claimed%20my%2010%25%20OFF%20VIP%20Coupon!`, '_blank');
      }, 1200);

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
          onClick={handleClose}
          aria-label="Close popup"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            zIndex: 10,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(4px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary-yellow)';
            e.currentTarget.style.color = '#000000';
            e.currentTarget.style.transform = 'rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.65)';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <X size={18} />
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
            <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '14px', padding: '16px', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ width: '42px', height: '42px', backgroundColor: '#22c55e', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <Check size={22} />
              </div>
              <h4 style={{ margin: '0 0 4px 0', color: '#14532d', fontSize: '1rem', fontWeight: 800 }}>VIP Offer Unlocked!</h4>
              <p style={{ margin: 0, color: '#166534', fontSize: '0.82rem' }}>Redirecting to WhatsApp to claim your 10% coupon code...</p>
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
