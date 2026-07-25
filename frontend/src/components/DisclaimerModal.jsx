import React from 'react';
import { X, ShieldAlert, AlertCircle } from 'lucide-react';

export default function DisclaimerModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <div
        className="modal-content animate-fade-in"
        style={{ 
          maxWidth: '550px', 
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
            <ShieldAlert size={22} style={{ color: '#d97706' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', margin: 0, color: '#0f172a', letterSpacing: '0.5px' }}>
              Legal Disclaimer
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0', fontWeight: 500 }}>
              Please read our medical and product usage statement
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
          <div style={{ display: 'flex', gap: '12px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <AlertCircle size={20} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0, color: '#92400e', fontSize: '#0.85rem', fontWeight: 600 }}>
              Important Health Notice: Dietary supplements are intended to support health goals, not to diagnose, treat, or cure illness.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ margin: 0 }}>
              The information contained on Elmen (
              <a href="https://www.elmen.in" target="_blank" rel="noopener noreferrer" style={{ color: '#d97706', textDecoration: 'none', fontWeight: 700 }}>
                www.elmen.in
              </a>{' '}
              or subdomains) is provided for informational purposes only and is not meant to substitute for the advice provided by your doctor or other healthcare professional.
            </p>

            <p style={{ margin: 0 }}>
              Information and statements regarding products, supplements, programs etc. listed on Elmen have been evaluated by the Food Safety and Standards Authority of India (FSSAI) but are not intended to diagnose, treat, cure, or prevent any disease.
            </p>

            <p style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
              Please read product packaging carefully prior to purchase and use.
            </p>

            <p style={{ margin: 0 }}>
              The results from the products will vary from person to person. No individual result should be seen as typical.
            </p>
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
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
