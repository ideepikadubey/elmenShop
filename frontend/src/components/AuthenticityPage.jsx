import React, { useState } from 'react';
import { ShieldCheck, HelpCircle, AlertTriangle, ShieldCheck as VerifiedIcon, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { API_BASE_URL, getImageUrl } from "./config/api";
export default function AuthenticityPage({ onGoBack }) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle, checking, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const [verifiedProduct, setVerifiedProduct] = useState('');

  // Pre-approved valid demo codes
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
        setErrorMsg('Security code not recognized. Please check the spellings or scratch layer again.');
      }
    }, 1500);
  };

  return (
    <div style={{ minHeight: '80vh', padding: '60px 0 100px', backgroundColor: '#000000', color: '#ffffff' }}>
      <div className="container">
        {/* Navigation back button */}
        <button
          onClick={onGoBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '32px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary-yellow)';
            e.currentTarget.style.color = 'var(--primary-yellow)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.color = '#ffffff';
          }}
        >
          <ArrowLeft size={16} /> Back to Store
        </button>

        <div className="section-header" style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, textTransform: 'uppercase', color: '#ffffff' }}>
            Product <span style={{ color: 'var(--primary-yellow)' }}>Authenticity Portal</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '720px', margin: '12px auto 0' }}>
            Muscle health and recovery require 100% genuine fuel. Use our anti-counterfeiting verification system to confirm your EL MEN supplement is authentic and batch certified.
          </p>
        </div>

        <div className="auth-container animate-fade-in" style={{ margin: '0 auto', maxWidth: '1000px' }}>
          <div className="auth-content" style={{ background: '#0a0a0a', border: '1px solid #1f2937', padding: '36px', borderRadius: '20px' }}>
            <h3 className="auth-title" style={{ color: '#ffffff' }}>Anti-Counterfeit <span style={{ color: 'var(--primary-yellow)' }}>Check</span></h3>
            <p className="auth-desc" style={{ color: '#94a3b8' }}>
              Locate the scratch layer on your EL MEN product container seal or label. Scratch to reveal your unique security code and submit below for real-time verification.
            </p>

            <form onSubmit={handleVerify} className="auth-form">
              <div className="form-group">
                <label style={{ color: '#cbd5e1' }}>Scratch Code / Serial Number</label>
                <div className="auth-form-row">
                  <input
                    type="text"
                    placeholder="e.g. ELMEN-WHEY-2026"
                    className="form-input"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    style={{ textTransform: 'uppercase', background: '#111827', border: '1px solid #374151', color: '#ffffff' }}
                    disabled={status === 'checking'}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={status === 'checking' || !code}
                    style={{ background: 'var(--primary-yellow)', color: '#000000', fontWeight: 900 }}
                  >
                    Verify Code
                  </button>
                </div>
              </div>
            </form>

            <div style={{ marginTop: '24px', fontSize: '0.85rem', color: '#94a3b8', backgroundColor: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937' }}>
              <p style={{ fontWeight: 'bold', color: 'var(--primary-yellow)', marginBottom: '8px' }}>Test with demo codes:</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: '10px', padding: 0, margin: 0 }}>
                <li><code style={{ background: '#1f2937', padding: '4px 8px', borderRadius: '6px', color: '#38bdf8' }}>ELMEN-WHEY-2026</code></li>
                <li><code style={{ background: '#1f2937', padding: '4px 8px', borderRadius: '6px', color: '#38bdf8' }}>ELMEN-GAIN-9988</code></li>
                <li><code style={{ background: '#1f2937', padding: '4px 8px', borderRadius: '6px', color: '#38bdf8' }}>ELMEN-CREA-5544</code></li>
              </ul>
            </div>
          </div>

          <div className="auth-results" style={{ background: '#0a0a0a', border: '1px solid #1f2937', padding: '36px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {status === 'idle' && (
              <div style={{ textAlign: 'center', color: '#64748b' }}>
                <HelpCircle size={56} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p style={{ fontSize: '1rem' }}>Enter security code to inspect database record...</p>
              </div>
            )}

            {status === 'checking' && (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Loader2 className="loading-spinner" size={48} style={{ animation: 'spin 1s linear infinite', border: 'none', borderLeft: '3px solid var(--primary-yellow)', borderRadius: '50%' }} />
                <p style={{ marginTop: '20px', fontWeight: 'bold', fontSize: '1.05rem', color: 'var(--primary-yellow)' }}>Verifying batch authenticity...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="certificate" style={{ width: '100%', border: '2px solid var(--primary-yellow)', background: '#111827' }}>
                <div className="certificate-verified-badge" style={{ backgroundColor: 'rgba(255, 190, 0, 0.15)', color: 'var(--primary-yellow)' }}>
                  <VerifiedIcon size={16} /> 100% Genuine Product
                </div>
                <h3 className="certificate-title" style={{ color: '#ffffff' }}>Certificate of Authenticity</h3>
                <div className="certificate-subtitle" style={{ color: 'var(--primary-yellow)' }}>EL MEN NUTRITION INDIA</div>

                <p style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: '20px 0 12px' }}>
                  This certifies that the product below is officially manufactured by EL MEN Nutrition under global GMP and ISO standards.
                </p>

                <p style={{ color: 'var(--primary-yellow)', fontWeight: 'bold', fontSize: '1.05rem', background: '#1f2937', padding: '10px 14px', borderRadius: '8px' }}>
                  {verifiedProduct}
                </p>

                <div className="certificate-serial" style={{ color: '#94a3b8' }}>
                  Security Code: {code.trim().toUpperCase()}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.75rem', fontWeight: 800, color: '#22c55e', marginTop: '16px' }}>
                  <span>✓ LAB TESTED</span>
                  <span>✓ GMP CERTIFIED</span>
                  <span>✓ FSSAI APPROVED</span>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="certificate" style={{ width: '100%', borderColor: 'var(--primary-red)', backgroundColor: '#111827' }}>
                <div className="certificate-verified-badge" style={{ borderColor: 'var(--primary-red)', color: 'var(--primary-red)', backgroundColor: 'rgba(193,0,0,0.15)' }}>
                  <AlertTriangle size={16} /> Verification Failed
                </div>
                <h3 className="certificate-title" style={{ color: 'var(--primary-red)' }}>Counterfeit Warning</h3>
                <div className="certificate-subtitle">Safety & Integrity Alert</div>

                <p style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: '20px 0 24px' }}>
                  {errorMsg}
                </p>

                <button className="btn btn-secondary" style={{ width: '100%', background: '#1f2937', color: '#ffffff' }} onClick={() => setStatus('idle')}>
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
