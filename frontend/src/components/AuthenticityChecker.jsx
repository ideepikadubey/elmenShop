import React, { useState, useEffect } from 'react';
import { ShieldCheck, HelpCircle, AlertTriangle, ShieldCheck as VerifiedIcon, Loader2, FileText } from 'lucide-react';

export default function AuthenticityChecker() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle, checking, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const [verifiedProduct, setVerifiedProduct] = useState('');
  const [subTab, setSubTab] = useState('check'); // check, reports

  useEffect(() => {
    const handler = (e) => {
      setSubTab(e.detail);
      setTimeout(() => {
        document.getElementById('authenticity')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    };
    window.addEventListener('elmen:authenticity', handler);
    return () => window.removeEventListener('elmen:authenticity', handler);
  }, []);

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
    <section className="authenticity-section" id="authenticity">
      <div className="container">
        <div className="section-header">
          <h2>Verify <span>Authenticity</span></h2>
          <p>
            Muscle health and recovery require genuine fuel. Use our anti-counterfeiting authentication portal to confirm your EL MEN supplement is 100% authentic and lab tested.
          </p>
        </div>



        {subTab === 'check' ? (
          <div className="auth-container animate-fade-in">
            <div className="auth-content">
              <h3 className="auth-title">Anti-Counterfeit <span>Check</span></h3>
              <p className="auth-desc">
                Locate the scratch code on the seal/label of your EL MEN Nutrition tub. Scratch to reveal the unique security code and input it below to verify your purchase.
              </p>

              <form onSubmit={handleVerify} className="auth-form">
                <div className="form-group">
                  <label>Scratch Code / Serial Number</label>
                  <div className="auth-form-row">
                    <input
                      type="text"
                      placeholder="Enter scratch code..."
                      className="form-input"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      style={{ textTransform: 'uppercase' }}
                      disabled={status === 'checking'}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={status === 'checking' || !code}
                    >
                      Verify
                    </button>
                  </div>
                </div>
              </form>


            </div>

            <div className="auth-results">
              {status === 'idle' && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <HelpCircle size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p>Waiting for security code submission...</p>
                </div>
              )}

              {status === 'checking' && (
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Loader2 className="loading-spinner" size={40} style={{ animation: 'spin 1s linear infinite', border: 'none', borderLeft: '3px solid var(--primary-yellow)', borderRadius: '50%' }} />
                  <p style={{ marginTop: '16px', fontWeight: 'bold' }}>Querying secure database...</p>
                </div>
              )}

              {status === 'success' && (
                <div className="certificate">
                  <div className="certificate-verified-badge">
                    <VerifiedIcon size={14} /> 100% Genuine Product
                  </div>
                  <h3 className="certificate-title">Certificate of Authenticity</h3>
                  <div className="certificate-subtitle">EL MEN Nutrition India</div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', margin: '16px 0 8px' }}>
                    This certifies that the product below is officially manufactured by EL MEN Nutrition under global GMP and ISO standards.
                  </p>

                  <p style={{ color: 'var(--primary-yellow)', fontWeight: 'bold', fontSize: '0.95rem' }}>
                    {verifiedProduct}
                  </p>

                  <div className="certificate-serial">
                    Security Code: {code.trim().toUpperCase()}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                    <span>✓ LAB TESTED</span>
                    <span>✓ GMP CERTIFIED</span>
                    <span>✓ FSSAI APPROVED</span>
                  </div>

                  {/* Decorative Seal */}
                  <div className="certificate-stamp">
                    <ShieldCheck size={80} color="var(--primary-yellow)" />
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="certificate" style={{ borderColor: 'var(--primary-red)', boxShadow: 'var(--shadow-glow-red)' }}>
                  <div className="certificate-verified-badge" style={{ borderColor: 'var(--primary-red)', color: 'var(--primary-red)', backgroundColor: 'rgba(193,0,0,0.1)' }}>
                    <AlertTriangle size={14} /> Verification Failed
                  </div>
                  <h3 className="certificate-title" style={{ color: 'var(--primary-red)' }}>Counterfeit Warning</h3>
                  <div className="certificate-subtitle">Safety & Integrity Alert</div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', margin: '16px 0 24px' }}>
                    {errorMsg}
                  </p>

                  <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setStatus('idle')}>
                    Try Another Code
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="auth-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', background: 'var(--bg-dark-800)', border: '1px solid var(--bg-dark-600)', padding: '40px 24px', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-glow)', textAlign: 'center', gap: '24px' }}>
            <div style={{ background: 'rgba(255, 190, 0, 0.1)', color: 'var(--primary-yellow)', padding: '20px', borderRadius: '50%', display: 'inline-flex' }}>
              <FileText size={48} />
            </div>
            <div>
              <h3 style={{ textTransform: 'uppercase', fontWeight: 900, marginBottom: '12px', fontSize: '1.5rem' }}>
                Official Laboratory <span>Analysis Reports</span>
              </h3>
              <p style={{ color: 'var(--text-gray)', maxWidth: '640px', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.6' }}>
                We test every single batch of our products at independent, NABL-accredited third-party laboratories. Preview the official certificates of analysis below to verify protein content, purity, and safety standards.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' }}>
              <a
                href="/LAB TEST REPORT.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
              >
                👁️ Open Fullscreen Preview
              </a>
              <button
                onClick={() => setSubTab('check')}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
              >
                🛡️ Go to Authenticity Check
              </button>
            </div>

            {/* Embedded In-Browser PDF Previewer */}
            <div style={{ width: '100%', marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: 'var(--bg-dark-900)', border: '1px solid var(--bg-dark-600)', borderBottom: 'none', borderRadius: '12px 12px 0 0' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-yellow)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Live Document Preview
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>NABL Certificate of Analysis</span>
              </div>
              <iframe
                src="/LAB TEST REPORT.pdf#toolbar=0"
                title="EL MEN Nutrition Lab Report Certificate"
                style={{
                  width: '100%',
                  height: '650px',
                  border: '1px solid var(--bg-dark-600)',
                  borderRadius: '0 0 12px 12px',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
