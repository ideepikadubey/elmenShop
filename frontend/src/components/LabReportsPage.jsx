import React from 'react';
import { FileText, ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';

export default function LabReportsPage({ onGoBack }) {
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
            Official Laboratory <span style={{ color: 'var(--primary-yellow)' }}>Analysis Reports</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '720px', margin: '12px auto 0' }}>
            Uncompromising transparency is our core principle. Every batch of EL MEN supplements undergoes independent NABL-accredited laboratory testing for protein potency, amino acid profile, heavy metals, and microbiological purity.
          </p>
        </div>

        <div 
          className="animate-fade-in"
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            background: '#0a0a0a', 
            border: '1px solid #1f2937', 
            padding: '40px', 
            borderRadius: '24px', 
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)', 
            maxWidth: '1100px',
            margin: '0 auto',
            gap: '24px' 
          }}
        >
          <div style={{ background: 'rgba(255, 190, 0, 0.12)', color: 'var(--primary-yellow)', padding: '20px', borderRadius: '50%', display: 'inline-flex' }}>
            <FileText size={48} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3 style={{ textTransform: 'uppercase', fontWeight: 900, marginBottom: '12px', fontSize: '1.6rem', color: '#ffffff' }}>
              NABL Certificate of Analysis (COA)
            </h3>
            <p style={{ color: '#94a3b8', maxWidth: '720px', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Below is the official third-party laboratory test report preview for EL MEN Clean Whey Protein and core performance supplements. You can view or download the report document directly.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', margin: '8px 0' }}>
            <a 
              href="/LAB TEST REPORT.pdf" 
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', background: 'var(--primary-yellow)', color: '#000000', fontWeight: 900, padding: '12px 24px', borderRadius: '30px' }}
            >
              <ExternalLink size={18} /> Open Fullscreen Report
            </a>
          </div>

          {/* Embedded In-Browser PDF Previewer */}
          <div style={{ width: '100%', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', background: '#111827', border: '1px solid #374151', borderBottom: 'none', borderRadius: '16px 16px 0 0' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-yellow)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} /> Accredited NABL Test Certificate
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Batch #EL-W09</span>
            </div>
            <iframe 
              src="/LAB TEST REPORT.pdf#toolbar=0" 
              title="EL MEN Nutrition Lab Report Certificate"
              style={{ 
                width: '100%', 
                height: '750px', 
                border: '1px solid #374151', 
                borderRadius: '0 0 16px 16px',
                backgroundColor: '#ffffff'
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
