import React from 'react';
import { X, RotateCcw, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ReturnPolicyModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <div
        className="modal-content animate-fade-in"
        style={{ 
          maxWidth: '650px', 
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
            <RotateCcw size={22} style={{ color: '#d97706' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', margin: 0, color: '#0f172a', letterSpacing: '0.5px' }}>
              Return &amp; Cancellation Policy
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0', fontWeight: 500 }}>
              Guidelines for cancellations, returns, and payments
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
        <div style={{
          padding: '24px 32px 32px',
          background: '#ffffff',
          color: '#475569',
          fontSize: '0.88rem',
          lineHeight: '1.6',
          maxHeight: '55vh',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Cancellation Policy */}
            <div>
              <h3 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '4px', height: '14px', background: '#eab308', borderRadius: '2px' }} />
                Cancellation Policy
              </h3>
              <p style={{ margin: '0 0 6px' }}>Once your order has been dispatched, cancellations are not possible. Please review your order carefully before placing it.</p>
              <p style={{ margin: 0 }}>Discount vouchers are single-use only. If you cancel an order placed using a voucher, the voucher will be marked as used and cannot be reapplied.</p>
            </div>

            {/* Return & Refund Policy */}
            <div>
              <h3 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '4px', height: '14px', background: '#eab308', borderRadius: '2px' }} />
                Return &amp; Refund Policy
              </h3>
              <p style={{ margin: '0 0 10px' }}>Due to the consumable and hygiene-sensitive nature of our products, Elmen products are generally non-returnable.</p>
              <p style={{ margin: '0 0 10px' }}>Returns are not applicable for subjective concerns like taste preference, flavour variation, or general digestive sensitivity. We recommend consulting your doctor before starting any supplement.</p>
              
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', margin: '12px 0' }}>
                <p style={{ margin: '0 0 8px', fontWeight: 800, color: '#b45309' }}>Received a damaged, tampered, or wrong product?</p>
                <p style={{ margin: '0 0 8px' }}>
                  Email us at{' '}
                  <a href="mailto:elmenindia@gmail.com" style={{ color: '#d97706', textDecoration: 'none', fontWeight: 700 }}>
                    elmenindia@gmail.com
                  </a>{' '}
                  within 24 hours of delivery with:
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', color: '#334155' }}>
                  <li>Unboxing video (mandatory)</li>
                  <li>Clear photos of product, invoice, inner &amp; outer packaging</li>
                  <li>Batch number visible on packaging</li>
                </ul>
                <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '0.78rem', fontWeight: 500 }}>We'll respond within 48–72 hours.</p>
              </div>

              <p style={{ margin: '0 0 10px' }}>Do not use the product you've raised a complaint about — set it aside until the issue is resolved.</p>
              <p style={{ margin: '0 0 10px' }}>Do not accept any shipment that appears damaged or tampered at delivery. We cannot process returns for accepted tampered parcels.</p>
              <p style={{ margin: 0 }}>If your order is returned due to unsuccessful delivery attempts, contact our team. We'll re-dispatch (subject to availability) or issue a refund as a voucher/Elmen Credit Points.</p>
            </div>

            {/* Snapmint Payment Returns */}
            <div>
              <h3 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '4px', height: '14px', background: '#eab308', borderRadius: '2px' }} />
                Snapmint Payment Returns
              </h3>
              <p style={{ margin: '0 0 6px' }}>Snapmint refunds are processed strictly to the original Snapmint payment method — no redirections to other accounts or wallets.</p>
              <p style={{ margin: 0 }}>For refund timelines or repayment schedule adjustments, please contact Snapmint directly.</p>
            </div>

            {/* Payment Policy */}
            <div>
              <h3 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '4px', height: '14px', background: '#eab308', borderRadius: '2px' }} />
                Payment Policy
              </h3>
              <p style={{ margin: '0 0 10px' }}>We accept Credit Cards, Debit Cards, Net Banking, UPI, and Cash on Delivery.</p>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <p style={{ margin: '0 0 8px', fontWeight: 800, color: '#b45309' }}>Payment deducted but no confirmation received?</p>
                <p style={{ margin: '0 0 8px' }}>Contact us with:</p>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', color: '#334155' }}>
                  <li>Transaction ID / reference number</li>
                  <li>Registered email &amp; phone number</li>
                  <li>Product(s) ordered &amp; amount debited</li>
                </ul>
              </div>
            </div>

            {/* A Note to Our Customers */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px' }}>
              <h3 style={{ color: '#166534', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} style={{ color: '#166534' }} />
                A Note to Our Customers
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#14532d', fontWeight: 500 }}>We go the extra mile for every genuine customer. To protect our wider community, our support team reserves the right to assess and act at their discretion in cases of repeated policy abuse — such as frequent cancellations, refusing shipments without reason, or unfounded complaints. This helps us keep delivering the best experience to you.</p>
            </div>

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
