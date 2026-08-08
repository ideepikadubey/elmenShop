import React from 'react';
import { X, Building2, MapPin, ShieldCheck, CheckCircle2, Factory } from 'lucide-react';

export default function ManufacturerModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <div
        className="modal-content animate-fade-in"
        style={{ 
          maxWidth: '560px', 
          padding: 0, 
          overflow: 'hidden', 
          borderRadius: '24px', 
          background: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 30px 60px rgba(15, 23, 42, 0.15)',
          color: '#1e293b',
          fontFamily: '"Outfit", "Inter", sans-serif'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          padding: '28px 32px 24px',
          borderBottom: '1px solid #f1f5f9',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fef9c3 0%, #fef3c7 100%)',
            border: '1px solid #fde68a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(251, 191, 36, 0.12)'
          }}>
            <Factory size={22} style={{ color: '#d97706' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', margin: 0, color: '#0f172a', letterSpacing: '0.5px' }}>
              Manufacturer Details
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0', fontWeight: 500 }}>
              Authorized manufacturing &amp; facility information
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '24px 32px 32px', background: '#ffffff', color: '#334155', fontSize: '0.9rem', lineHeight: '1.6' }}>
          
          {/* Main Manufacturer Card */}
          <div style={{
            background: 'linear-gradient(135deg, #090909 0%, #171717 100%)',
            color: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #262626',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Subtle glow accent */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '120px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(234, 179, 8, 0.15) 0%, rgba(0,0,0,0) 70%)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Building2 size={16} style={{ color: '#eab308' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#eab308' }}>
                Manufactured By
              </span>
            </div>

            <h3 style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 12px 0',
              lineHeight: '1.4'
            }}>
              RSA Herboceuticals group of (RSA Herbal Pharmaceutical)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#d4d4d8', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={16} style={{ color: '#eab308', flexShrink: 0, marginTop: '3px' }} />
                <span>
                  Manufacturer in Prahladpura, Rajasthan
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '24px' }}>
                <span style={{
                  background: 'rgba(234, 179, 8, 0.15)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  color: '#fef08a',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  letterSpacing: '0.5px'
                }}>
                  Pincode :- 302022
                </span>
              </div>
            </div>
          </div>

          {/* Assurances & Standards */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: '#16a34a' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Facility Standards &amp; Quality Control
              </span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#475569' }}>
              <li>Formulated and packed under strict GMP and FSSAI certified conditions.</li>
              <li>USA imported premium raw ingredients processed with high precision.</li>
              <li>Every production batch is tested for purity, potency, and safety.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 32px 24px',
          borderTop: '1px solid #f1f5f9',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            className="btn btn-primary"
            style={{ 
              padding: '10px 24px', 
              fontSize: '0.85rem', 
              borderRadius: '20px', 
              fontWeight: 800,
              textTransform: 'uppercase',
              backgroundColor: '#eab308',
              color: '#0f172a',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(234, 179, 8, 0.2)'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ca8a04'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#eab308'}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
