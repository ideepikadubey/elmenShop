import React, { useState } from 'react';
import { ShieldCheck, HelpCircle, AlertTriangle, ShieldCheck as VerifiedIcon, Loader2, ArrowLeft, CheckCircle, Lock } from 'lucide-react';

export default function AuthenticityPage({ onGoBack }) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle, checking, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const [verifiedProduct, setVerifiedProduct] = useState('');

  // Valid codes mapping (kept internally for verification)
  const validCodes = {
    'ELMEN-WHEY-2026': 'Clean Whey Protein - 2kg (Batch: EL-W09)',
    'ELMEN-GAIN-9988': 'Pro Gain Advanced Mass Gainer - 3kg (Batch: EL-G04)',
    'ELMEN-CREA-5544': 'Micronized Creatine Monohydrate - 240g (Batch: EL-C11)',
    'ELMEN-TEST-1234': 'Testo One Natural Herbs - 60 Tab (Batch: EL-T02)',
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setStatus('checking');

    setTimeout(() => {
      const normalizedCode = code.trim().toUpperCase();
      if (validCodes[normalizedCode]) {
        setVerifiedProduct(validCodes[normalizedCode]);
        setStatus('success');
        setErrorMsg('');
      } else {
        setStatus('error');
        setErrorMsg('Security code not recognized. Please check the code on your product container scratch layer.');
      }
    }, 1200);
  };

  return (
    <div style={{ minHeight: '85vh', padding: '36px 0 90px', background: 'linear-gradient(180deg, #0b0f19 0%, #111827 100%)', color: 'var(--text-white)', fontFamily: '"Outfit", "Inter", sans-serif' }}>
      <div className="container">

        {/* Back to Store Button with top padding */}
        <div style={{ paddingTop: '20px', marginBottom: '28px' }}>
          <button
            onClick={onGoBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid #334155',
              color: '#f8fafc',
              padding: '10px 20px',
              borderRadius: '30px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              backdropFilter: 'blur(8px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary-yellow)';
              e.currentTarget.style.color = 'var(--primary-yellow)';
              e.currentTarget.style.transform = 'translateX(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#334155';
              e.currentTarget.style.color = '#f8fafc';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <ArrowLeft size={16} /> Back to Store
          </button>
        </div>

        {/* Compact Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 190, 0, 0.12)', border: '1px solid rgba(255, 190, 0, 0.3)', padding: '5px 14px', borderRadius: '20px', color: 'var(--primary-yellow)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
            <ShieldCheck size={14} /> Official Verification Portal
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#ffffff', margin: 0, letterSpacing: '0.5px' }}>
            Product <span style={{ color: 'var(--primary-yellow)' }}>Authenticity Check</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', maxWidth: '520px', margin: '10px auto 0', lineHeight: 1.5, fontWeight: 500 }}>
            Enter your unique product scratch code to confirm 100% genuine batch certification.
          </p>
        </div>

        {/* Compact Centered Card Box */}
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(255, 190, 0, 0.25)',
            padding: '30px 32px',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(12px)'
          }}>
            <form onSubmit={handleVerify}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Scratch Code / Security Serial
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Enter scratch code..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: '#0f172a',
                      border: '1.5px solid #334155',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-yellow)'}
                    onBlur={(e) => e.target.style.borderColor = '#334155'}
                    disabled={status === 'checking'}
                  />
                  <button
                    type="submit"
                    disabled={status === 'checking' || !code.trim()}
                    style={{
                      padding: '12px 22px',
                      background: 'var(--primary-yellow)',
                      color: '#0f172a',
                      fontWeight: 900,
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      boxShadow: '0 4px 12px rgba(234, 179, 8, 0.3)',
                      transition: 'all 0.2s',
                      opacity: (status === 'checking' || !code.trim()) ? 0.6 : 1
                    }}
                  >
                    Verify
                  </button>
                </div>
              </div>
            </form>

            {/* Results Section */}
            {status === 'idle' && (
              <div style={{ textAlign: 'center', padding: '16px 0 6px', color: '#64748b', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Lock size={14} style={{ color: 'var(--primary-yellow)' }} />
                <span>Scratch security label on tub seal to reveal code</span>
              </div>
            )}

            {status === 'checking' && (
              <div style={{ textAlign: 'center', padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Loader2 className="loading-spinner" size={36} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-yellow)', marginBottom: '12px' }} />
                <p style={{ margin: 0, fontWeight: 800, fontSize: '0.92rem', color: 'var(--primary-yellow)' }}>Verifying batch authenticity...</p>
              </div>
            )}

            {status === 'success' && (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                borderRadius: '14px',
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1.5px solid #22c55e',
                textAlign: 'center'
              }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#22c55e', color: '#0f172a', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 900, marginBottom: '10px' }}>
                  <CheckCircle size={14} /> 100% GENUINE PRODUCT
                </div>
                <h4 style={{ margin: '4px 0', fontSize: '1.05rem', fontWeight: 900, color: '#ffffff' }}>Certificate of Authenticity</h4>
                <p style={{ margin: '8px 0', fontSize: '0.88rem', color: '#4ade80', fontWeight: 800, background: 'rgba(15, 23, 42, 0.6)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                  {verifiedProduct}
                </p>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>
                  Serial: {code.trim().toUpperCase()}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.72rem', fontWeight: 800, color: '#22c55e', marginTop: '12px' }}>
                  <span>✓ LAB TESTED</span>
                  <span>✓ GMP CERTIFIED</span>
                  <span>✓ FSSAI APPROVED</span>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                borderRadius: '14px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1.5px solid #ef4444',
                textAlign: 'center'
              }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ef4444', color: '#ffffff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 900, marginBottom: '10px' }}>
                  <AlertTriangle size={14} /> VERIFICATION FAILED
                </div>
                <p style={{ margin: '8px 0 14px', fontSize: '0.85rem', color: '#f8fafc' }}>
                  {errorMsg}
                </p>
                <button
                  style={{ background: '#334155', border: 'none', color: '#ffffff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => setStatus('idle')}
                >
                  Try Another Code
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
