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
    <div style={{ minHeight: '85vh', padding: '36px 0 90px', background: '#ffffff', color: '#0f172a', fontFamily: '"Outfit", "Inter", sans-serif' }}>
      <div className="container">

        {/* Back to Store Button with top padding */}
        <div style={{ paddingTop: '20px', marginBottom: '28px' }}>
          <button
            onClick={onGoBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              color: '#0f172a',
              padding: '10px 20px',
              borderRadius: '30px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#d97706';
              e.currentTarget.style.color = '#d97706';
              e.currentTarget.style.transform = 'translateX(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.color = '#0f172a';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <ArrowLeft size={16} /> Back to Store
          </button>
        </div>

        {/* Compact Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fffbeb', border: '1px solid #fde68a', padding: '5px 14px', borderRadius: '20px', color: '#b45309', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
            <ShieldCheck size={14} /> Official Verification Portal
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#0f172a', margin: 0, letterSpacing: '0.5px' }}>
            Product <span style={{ color: '#d97706' }}>Authenticity Check</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '520px', margin: '10px auto 0', lineHeight: 1.5, fontWeight: 500 }}>
            Enter your unique product scratch code to confirm 100% genuine batch certification.
          </p>
        </div>

        {/* Compact Centered Card Box */}
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            padding: '32px',
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            <form onSubmit={handleVerify}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
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
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '12px',
                      color: '#0f172a',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#eab308'}
                    onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                    disabled={status === 'checking'}
                  />
                  <button
                    type="submit"
                    disabled={status === 'checking' || !code.trim()}
                    style={{
                      padding: '12px 24px',
                      background: '#eab308',
                      color: '#0f172a',
                      fontWeight: 900,
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      boxShadow: '0 4px 12px rgba(234, 179, 8, 0.25)',
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
                <Lock size={14} style={{ color: '#d97706' }} />
                <span>Scratch security label on tub seal to reveal code</span>
              </div>
            )}

            {status === 'checking' && (
              <div style={{ textAlign: 'center', padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Loader2 className="loading-spinner" size={36} style={{ animation: 'spin 1s linear infinite', color: '#d97706', marginBottom: '12px' }} />
                <p style={{ margin: 0, fontWeight: 800, fontSize: '0.92rem', color: '#d97706' }}>Verifying batch authenticity...</p>
              </div>
            )}

            {status === 'success' && (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                borderRadius: '14px',
                background: '#f0fdf4',
                border: '1.5px solid #22c55e',
                textAlign: 'center'
              }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#22c55e', color: '#ffffff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 900, marginBottom: '10px' }}>
                  <CheckCircle size={14} /> 100% GENUINE PRODUCT
                </div>
                <h4 style={{ margin: '4px 0', fontSize: '1.05rem', fontWeight: 900, color: '#14532d' }}>Certificate of Authenticity</h4>
                <p style={{ margin: '8px 0', fontSize: '0.88rem', color: '#15803d', fontWeight: 800, background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  {verifiedProduct}
                </p>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px' }}>
                  Serial: {code.trim().toUpperCase()}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.72rem', fontWeight: 800, color: '#16a34a', marginTop: '12px' }}>
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
                background: '#fef2f2',
                border: '1.5px solid #ef4444',
                textAlign: 'center'
              }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ef4444', color: '#ffffff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 900, marginBottom: '10px' }}>
                  <AlertTriangle size={14} /> VERIFICATION FAILED
                </div>
                <p style={{ margin: '8px 0 14px', fontSize: '0.85rem', color: '#991b1b', fontWeight: 500 }}>
                  {errorMsg}
                </p>
                <button
                  style={{ background: '#0f172a', border: 'none', color: '#ffffff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
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
