import React, { useState } from 'react';
import { Send, Phone, MessageSquare, Instagram, Facebook, Mail } from 'lucide-react';

export default function Footer({ onNavClick }) {
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone.trim())) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      // Open a generic WhatsApp group link or custom message
      window.open(`https://wa.me/91${phone.trim()}?text=I%20want%20to%20join%20the%20EL%20MEN%20WhatsApp%20Community!`, '_blank');
      setPhone('');
      setSubmitted(false);
    }, 800);
  };

  return (
    <footer style={{ background: '#090909', borderTop: '1px solid #1c1c1c', padding: '60px 0 30px', color: '#fff' }}>
      <div className="container">
        
        {/* Top footer grid: Brand Info + WhatsApp Community */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '40px',
          paddingBottom: '40px',
          borderBottom: '1px solid #1a1a1a'
        }}>
          {/* Brand Col */}
          <div style={{ flex: '1 1 350px', minWidth: '280px' }}>
            <div 
              style={{ 
                cursor: 'pointer', 
                marginBottom: '16px', 
                width: '170px', 
                height: '60px', 
                overflow: 'hidden', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'flex-start' 
              }} 
              onClick={() => onNavClick('home')}
            >
              <img 
                src="/logo footer.png" 
                alt="EL MEN Nutrition" 
                style={{ 
                  width: '100%', 
                  height: '160px', 
                  objectFit: 'cover', 
                  objectPosition: 'center', 
                  display: 'block' 
                }} 
              />
            </div>
            <p style={{ color: '#aaa', fontSize: '0.88rem', lineHeight: '1.6', margin: 0, maxWidth: '420px' }}>
              We have put the positive, feel-good vibe into elite sports nutrition. Clean formulations, premium ingredients, and 100% transparency to fuel your ultimate fitness goals.
            </p>
          </div>

          {/* WhatsApp / Social Col */}
          <div style={{ flex: '1 1 380px', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h4 style={{
                fontSize: '0.9rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '10px',
                color: '#fff'
              }}>
                JOIN OUR WHATSAPP COMMUNITY
              </h4>
              <p style={{ color: '#888', fontSize: '0.78rem', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                GET 10% OFF YOUR FIRST ORDER &amp; UNLOCK EXCLUSIVE DEALS
              </p>

              {/* Form container matching the screenshot style */}
              <form onSubmit={handleWhatsAppSubmit} style={{
                display: 'flex',
                alignItems: 'center',
                background: '#141414',
                border: '1.5px solid #2e2e2e',
                borderRadius: '50px',
                padding: '4px 6px 4px 18px',
                maxWidth: '420px',
                transition: 'border-color 0.2s'
              }}>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: '#fff',
                    fontSize: '0.85rem',
                    padding: '8px 0',
                    fontFamily: 'monospace'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: '#25d366',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '8px 20px',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'background 0.2s',
                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#20ba5a'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#25d366'}
                >
                  {submitted ? 'Joining...' : 'Join Community →'}
                </button>
              </form>
            </div>

            {/* Social Icons row */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: '#888', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#888'}>
                <Instagram size={18} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: '#888', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#888'}>
                <Facebook size={18} />
              </a>
              <a href="mailto:elmenindia@gmail.com" style={{ color: '#888', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#888'}>
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Middle footer links row (styled exactly like the screenshot navigation) */}
        <div style={{
          padding: '24px 0',
          borderBottom: '1px solid #1a1a1a',
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <a href="#track-order" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('elmen:openTrackOrder')); }} style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-yellow)'} onMouseLeave={(e) => e.currentTarget.style.color = '#aaa'}>Track Your Order</a>
          <a href="#offers" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('elmen:openOffers')); }} style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-yellow)'} onMouseLeave={(e) => e.currentTarget.style.color = '#aaa'}>Offers &amp; Coupons</a>
          <a href="#return-policy" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('elmen:openReturnPolicy')); }} style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-yellow)'} onMouseLeave={(e) => e.currentTarget.style.color = '#aaa'}>Return/Exchange</a>
          <a href="#authenticity" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('elmen:authenticity', { detail: 'check' })); }} style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-yellow)'} onMouseLeave={(e) => e.currentTarget.style.color = '#aaa'}>Verify Your Product</a>
          <a href="#lab-reports" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('elmen:authenticity', { detail: 'reports' })); }} style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-yellow)'} onMouseLeave={(e) => e.currentTarget.style.color = '#aaa'}>Lab Test Reports</a>
          <a href="#terms" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('elmen:openTerms')); }} style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-yellow)'} onMouseLeave={(e) => e.currentTarget.style.color = '#aaa'}>Terms Of Service</a>
          <a href="#privacy" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('elmen:openPrivacy')); }} style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-yellow)'} onMouseLeave={(e) => e.currentTarget.style.color = '#aaa'}>Privacy Policy</a>
          <a href="#disclaimer" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('elmen:openDisclaimer')); }} style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-yellow)'} onMouseLeave={(e) => e.currentTarget.style.color = '#aaa'}>Disclaimer</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); onNavClick('contact'); }} style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-yellow)'} onMouseLeave={(e) => e.currentTarget.style.color = '#aaa'}>Contact Us</a>
        </div>

        {/* Disclaimer box */}
        <div style={{
          background: '#0d0d0d',
          border: '1px solid #1a1a1a',
          borderRadius: '10px',
          padding: '16px 20px',
          margin: '28px 0',
          fontSize: '0.75rem',
          color: '#666',
          lineHeight: '1.6'
        }}>
          <h5 style={{ textTransform: 'uppercase', color: '#888', fontWeight: 900, marginBottom: '6px', fontSize: '0.78rem' }}>Disclaimer</h5>
          <p style={{ margin: 0 }}>
            This product is not intended to diagnose, treat, cure or prevent any disease. Consult your physician before starting any new supplement, especially if you are under medication or have a pre-existing medical condition. USA imported raw ingredients are processed in high-standard Indian facilities.
          </p>
        </div>

        {/* Bottom copyright & badges */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.78rem',
          color: '#666'
        }}>
          <p style={{ margin: 0 }}>© 2026 EL MEN Nutrition. All Rights Reserved. Designed with athletic energy.</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['UPI', 'Cards', 'NetBanking', 'COD'].map(badge => (
              <span key={badge} style={{
                background: '#141414',
                border: '1px solid #222',
                color: '#888',
                borderRadius: '4px',
                padding: '3px 8px',
                fontWeight: 800,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>{badge}</span>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
