import React, { useState } from 'react';
import axios from 'axios';
import { Send, X, MessageSquare, MapPin } from 'lucide-react';

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '', isDealer: false });
  const [isSent, setIsSent] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setIsSent(true);
    try {
      const payload = {
        ...formData,
        message: formData.isDealer ? `[DEALER ENQUIRY] ${formData.message}` : formData.message
      };
      await axios.post('http://localhost:5000/api/enquiries', payload);
      setFormData({ name: '', email: '', message: '', isDealer: false });
      setIsOpen(false);
      alert('Your message has been sent successfully! Our team will get in touch with you shortly.');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSent(false);
    }
  };

  return (
    <section className="contact-section" id="contact" style={{ padding: '80px 0' }}>
      <div className="container">
        <div className="section-header">
          <h2>Get In <span>Touch</span></h2>
          <p>Have questions about our protein blend, certifications, or custom orders? Reach out to our supplement experts.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginTop: '40px'
        }}>
          {/* Card 1: Call Support */}
          <div style={{
            background: 'var(--bg-dark-800)',
            border: '1px solid var(--bg-dark-700)',
            borderRadius: '12px',
            padding: '28px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eef2f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/call.png" alt="Call Support" style={{ width: 26, height: 26, objectFit: 'contain' }} />
            </div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Call Support</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-white)' }}>+91 9119119187</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mon - Sat (9 AM - 6 PM)</p>
          </div>

          {/* Card 2: Email Us */}
          <div style={{
            background: 'var(--bg-dark-800)',
            border: '1px solid var(--bg-dark-700)',
            borderRadius: '12px',
            padding: '28px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/gmail.png" alt="Email Us" style={{ width: 26, height: 26, objectFit: 'contain' }} />
            </div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Us</h4>
            <a href="mailto:elmenindia@gmail.com" style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-white)', textDecoration: 'none', wordBreak: 'break-all' }}>elmenindia@gmail.com</a>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>We reply within 24 hours</p>
          </div>

          {/* Card 3: WhatsApp Us */}
          <a 
            href="https://wa.me/919119119187"
            target="_blank" 
            rel="noreferrer"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{
              background: 'var(--bg-dark-800)',
              border: '1px solid var(--bg-dark-700)',
              borderRadius: '12px',
              padding: '28px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              height: '100%',
              boxShadow: 'var(--shadow-glow)',
              transition: 'transform 0.25s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/whastapp.png" alt="WhatsApp Support" style={{ width: 26, height: 26, objectFit: 'contain' }} />
              </div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>WhatsApp Us</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#25d366' }}>+91 9119119187</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chat with us anytime</p>
            </div>
          </a>

          {/* Card 4: Corporate Office */}
          <div style={{
            background: 'var(--bg-dark-800)',
            border: '1px solid var(--bg-dark-700)',
            borderRadius: '12px',
            padding: '28px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff9e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={22} color="var(--primary-yellow)" />
            </div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Corporate Office</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-white)', lineHeight: 1.4 }}>
              Baif Road, Wagholi,<br />Pune, Maharashtra
            </p>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pincode - 412207</p>
          </div>

          {/* Card 5: Business Enquiry */}
          <div 
            onClick={() => window.dispatchEvent(new CustomEvent('elmen:openBusinessEnquiry'))}
            style={{
              background: 'var(--bg-dark-800)',
              border: '1px solid var(--bg-dark-700)',
              borderRadius: '12px',
              padding: '28px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              boxShadow: 'var(--shadow-glow)',
              cursor: 'pointer',
              transition: 'all 0.25s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'var(--primary-yellow)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--bg-dark-700)';
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 190, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={22} color="var(--primary-yellow)" />
            </div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-yellow)', letterSpacing: '0.5px' }}>Business Enquiry</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-white)' }}>Partnership & Bulk</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to contact us</p>
          </div>
        </div>
      </div>
    </section>
  );
}
