import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, HelpCircle, AlertTriangle, ShieldCheck as VerifiedIcon, Loader2, FileText, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function AuthenticityChecker() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle, checking, success, error, already_used
  const [errorMsg, setErrorMsg] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
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

  // Hardcoded fallback codes
  const fallbackCodes = {
    'ELMEN-WHEY-2026': { serialNum: '5001', productName: 'Clean Whey Protein - 2kg (Batch: EL-W09)' },
    'ELMEN-GAIN-9988': { serialNum: '5002', productName: 'Pro Gain Advanced Mass Gainer - 3kg (Batch: EL-G04)' },
    'ELMEN-CREA-5544': { serialNum: '5003', productName: 'Micronized Creatine Monohydrate - 240g (Batch: EL-C11)' },
    'ELMEN-TEST-1234': { serialNum: '5004', productName: 'Testo One Natural Herbs - 60 Tab (Batch: EL-T02)' },
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setStatus('checking');
    setErrorMsg('');
    setVerifyResult(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/verification/verify`, {
        code: code.trim()
      });

      if (res.data && res.data.success) {
        setVerifyResult(res.data);
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(res.data.message || 'Verification failed. Please check the security code.');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.isAlreadyUsed) {
          setVerifyResult(data);
          setStatus('already_used');
          setErrorMsg(data.message);
        } else {
          setStatus('error');
          setErrorMsg(data.message || 'Security code not recognized. Please check your scratch layer code.');
        }
      } else {
        // Fallback for offline local dev mode if API is unreachable
        const normalized = code.trim().toUpperCase();
        if (fallbackCodes[normalized]) {
          setVerifyResult({
            serialNum: fallbackCodes[normalized].serialNum,
            code: normalized,
            productName: fallbackCodes[normalized].productName,
            batchNumber: 'EL-BATCH-2026'
          });
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMsg('Security code not recognized. Please check the code on your product container scratch layer.');
        }
      }
    }
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
                      className="btn btn-primary auth-verify-btn"
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

              {status === 'success' && verifyResult && (
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
                    {verifyResult.productName}
                  </p>

                  <div className="certificate-serial">
                    Serial Number: #{verifyResult.serialNum} &nbsp;|&nbsp; Code: {verifyResult.code}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                    <span>✓ LAB TESTED</span>
                    <span>✓ GMP CERTIFIED</span>
                    <span>✓ FSSAI APPROVED</span>
                  </div>

                  <div className="certificate-stamp">
                    <ShieldCheck size={80} color="var(--primary-yellow)" />
                  </div>
                </div>
              )}

              {status === 'already_used' && verifyResult && (
                <div className="certificate" style={{ borderColor: 'var(--primary-red)', boxShadow: 'var(--shadow-glow-red)' }}>
                  <div className="certificate-verified-badge" style={{ borderColor: 'var(--primary-red)', color: 'var(--primary-red)', backgroundColor: 'rgba(193,0,0,0.1)' }}>
                    <AlertCircle size={14} /> Code Already Claimed
                  </div>
                  <h3 className="certificate-title" style={{ color: 'var(--primary-red)' }}>Single-Use Security Alert</h3>
                  <div className="certificate-subtitle">Verification Warning</div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', margin: '14px 0' }}>
                    {errorMsg}
                  </p>

                  <div className="certificate-serial" style={{ color: 'var(--primary-red)' }}>
                    Serial #: {verifyResult.serialNum} | Code: {verifyResult.code}
                  </div>

                  <button className="btn btn-secondary" style={{ width: '100%', marginTop: '10px' }} onClick={() => setStatus('idle')}>
                    Try Another Code
                  </button>
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
          </div>
        )}
      </div>
    </section>
  );
}
