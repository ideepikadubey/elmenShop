import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tag, Percent, IndianRupee, Copy, Check, CalendarDays, Loader2, Gift, ArrowLeft, ShoppingBag, Sparkles, ShieldCheck } from 'lucide-react';

export default function Offers({ onGoBack, onShopClick }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/offers`)
      .then(res => {
        if (res.data.success) setOffers(res.data.offers);
      })
      .catch((err) => {
        console.error('Failed to load offers:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(''), 2500);
    });
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const daysLeft = (endDate) => {
    return Math.ceil((new Date(endDate) - Date.now()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div
      className="offers-page-wrapper"
      style={{
        background: 'radial-gradient(circle at 50% 0%, #ffffff 0%, #f4f6f9 100%)',
        minHeight: '85vh',
        paddingTop: '150px',
        paddingBottom: '80px',
        paddingLeft: 0,
        paddingRight: 0,
        color: '#1e293b',
        fontFamily: '"Outfit", "Inter", -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative ambient background glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '5%', width: '450px', height: '450px', background: 'rgba(251, 191, 36, 0.07)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: '550px', height: '550px', background: 'rgba(34, 197, 94, 0.05)', filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none' }}></div>

      <div className="container" style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>

        {/* Back Button & Top Header Tag */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '36px' }}>
          <button
            onClick={onGoBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
              borderRadius: '30px',
              color: '#0f172a',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              padding: '8px 18px',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary-yellow)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(255, 190, 0, 0.2)';
              e.currentTarget.style.transform = 'translateX(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.04)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <ArrowLeft size={16} /> Back to Store
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1.5px solid #fde68a', padding: '8px 18px', borderRadius: '30px', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.08)', whiteSpace: 'nowrap' }}>
            <Sparkles size={15} style={{ color: '#d97706' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.75px' }}>
              Official Promotional Hub
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#0f172a', margin: '0 0 14px 0', letterSpacing: '-1.5px', lineHeight: '1.1' }}>
            Offers & <span style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Coupons</span>
          </h1>
          <p style={{ color: '#475569', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto', lineHeight: '1.6', fontWeight: 500 }}>
            Unlock savings on your favorite EL MEN Nutrition supplements. Copy any active code below and apply it seamlessly during checkout.
          </p>
        </div>

        {/* Offers Grid / States */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
            <Loader2 size={44} style={{ color: '#eab308', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '20px', color: '#64748b', fontSize: '0.95rem', fontWeight: 600 }}>Loading active promotional deals...</p>
          </div>
        ) : offers.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 32px',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Tag size={32} style={{ color: '#94a3b8' }} />
            </div>
            <h3 style={{ fontWeight: 900, color: '#0f172a', marginBottom: '8px', fontSize: '1.25rem' }}>No Active Offers Right Now</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '420px', margin: '0 auto 24px', lineHeight: '1.5' }}>
              We update our special discounts regularly. Check back soon or browse our catalog for everyday low prices.
            </p>
            <button
              onClick={onGoBack}
              style={{
                padding: '12px 28px',
                borderRadius: '30px',
                backgroundColor: '#eab308',
                color: '#0f172a',
                border: 'none',
                fontWeight: 800,
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(234, 179, 8, 0.25)'
              }}
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
            {offers.map(offer => {
              const days = daysLeft(offer.endDate);
              const urgent = days <= 3 && days >= 0;
              const isCopied = copiedCode === offer.code;

              return (
                <div
                  key={offer._id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: `1.5px solid ${urgent ? '#fecaca' : '#e2e8f0'}`,
                    borderRadius: '24px',
                    padding: '28px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(15, 23, 42, 0.07)';
                    e.currentTarget.style.borderColor = urgent ? '#ef4444' : '#fbbf24';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(15, 23, 42, 0.03)';
                    e.currentTarget.style.borderColor = urgent ? '#fecaca' : '#e2e8f0';
                  }}
                >
                  {/* Left accent bar */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0, width: '6px',
                    background: urgent ? 'linear-gradient(180deg, #ef4444, #dc2626)' : 'linear-gradient(180deg, #fbbf24, #d97706)',
                    borderRadius: '6px 0 0 6px'
                  }} />

                  <div>
                    {/* Top Meta Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #fef9c3 0%, #fef3c7 100%)',
                          border: '1px solid #fde68a',
                          borderRadius: '10px',
                          padding: '6px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          {offer.discountType === 'percentage'
                            ? <Percent size={14} style={{ color: '#b45309' }} />
                            : <IndianRupee size={14} style={{ color: '#b45309' }} />
                          }
                          <span style={{ fontWeight: 900, fontSize: '0.95rem', color: '#b45309' }}>
                            {offer.discountType === 'percentage'
                              ? `${offer.discountValue}% OFF`
                              : `₹${offer.discountValue} OFF`
                            }
                          </span>
                        </div>

                        {urgent && (
                          <span style={{
                            background: '#fef2f2', border: '1px solid #fecaca',
                            color: '#dc2626', fontSize: '0.72rem', fontWeight: 800,
                            padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.5px'
                          }}>
                            Expires Soon
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '0.78rem', fontWeight: 600 }}>
                        <CalendarDays size={14} />
                        <span>Valid till {formatDate(offer.endDate)}</span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
                        {offer.title}
                      </h3>
                      {offer.description && (
                        <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0, lineHeight: '1.55', fontWeight: 500 }}>
                          {offer.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Coupon Box & Copy CTA */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      flex: 1,
                      background: '#f8fafc',
                      border: '1.5px dashed #cbd5e1',
                      borderRadius: '14px',
                      padding: '12px 18px',
                      fontFamily: 'monospace',
                      fontWeight: 900,
                      fontSize: '1.15rem',
                      color: '#b45309',
                      letterSpacing: '2px',
                      textAlign: 'center',
                      userSelect: 'all'
                    }}>
                      {offer.code}
                    </div>

                    <button
                      onClick={() => handleCopy(offer.code)}
                      style={{
                        background: isCopied ? '#f0fdf4' : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                        border: isCopied ? '1.5px solid #bbf7d0' : 'none',
                        borderRadius: '14px',
                        padding: '14px 22px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        color: isCopied ? '#166534' : '#0f172a',
                        fontWeight: 900,
                        fontSize: '0.88rem',
                        textTransform: 'uppercase',
                        transition: 'all 0.25s ease',
                        whiteSpace: 'nowrap',
                        boxShadow: isCopied ? 'none' : '0 6px 18px rgba(245, 158, 11, 0.25)'
                      }}
                      onMouseEnter={e => {
                        if (!isCopied) {
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 8px 22px rgba(245, 158, 11, 0.35)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isCopied) {
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = '0 6px 18px rgba(245, 158, 11, 0.25)';
                        }
                      }}
                    >
                      {isCopied ? (
                        <>
                          <Check size={16} /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} /> Copy Code
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Terms Footer Box */}
        <div style={{ marginTop: '48px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
          <ShieldCheck size={22} style={{ color: '#d97706', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', fontWeight: 500 }}>
            <strong>Offer Usage Terms:</strong> Only one promotional coupon code can be redeemed per order during checkout. Coupons cannot be combined with other ongoing automated discounts.
          </p>
        </div>

      </div>
    </div>
  );
}
