import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "../config/api";
import { X, Trash2, ArrowRight, Tag, LogIn, ChevronDown, ChevronUp, CheckCircle2, Percent, IndianRupee } from 'lucide-react';

export default function CartDrawer({ cartItems, onClose, onUpdateQty, onRemoveItem, onCheckout, user, userOrderCount = 0, onRequireLogin }) {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, discountType, discountValue, title }
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [availableOffers, setAvailableOffers] = useState([]);
  const [showOffers, setShowOffers] = useState(false);

  // Format price helper
  const formatPrice = (amount) => amount.toLocaleString('en-IN');

  // Fetch available offers from backend
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/offers`)
      .then(res => { if (res.data.success) setAvailableOffers(res.data.offers); })
      .catch(() => { });
  }, []);

  // Calculate totals
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const discountAmount = (() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.discountType === 'percentage') return Math.round(subtotal * appliedPromo.discountValue / 100);
    return Math.min(appliedPromo.discountValue, subtotal); // flat
  })();

  const deliveryCharges = (userOrderCount === 0 || subtotal === 0) ? 0 : 49;
  const finalTotal = subtotal - discountAmount + deliveryCharges;

  // Validate coupon via backend (one coupon only)
  const handleApplyPromo = async (codeOverride) => {
    const code = (codeOverride || promoCode).trim().toUpperCase();
    if (!code) return;
    if (appliedPromo) {
      setPromoError('You can only apply one coupon per order. Remove the current one first.');
      return;
    }
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/offers/validate`, { code });
      setAppliedPromo({
        code: res.data.offer.code,
        title: res.data.offer.title,
        discountType: res.data.offer.discountType,
        discountValue: res.data.offer.discountValue,
      });
      setPromoCode('');
      setShowOffers(false);
    } catch (err) {
      setPromoError(err.response?.data?.message || 'Invalid or expired coupon code.');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError('');
  };

  const discountLabel = appliedPromo
    ? appliedPromo.discountType === 'percentage'
      ? `${appliedPromo.discountValue}% off`
      : `₹${appliedPromo.discountValue} flat off`
    : '';

  return (
    <>
      <div
        className="cart-drawer-overlay"
        onClick={onClose}
        style={{ zIndex: 1050, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      ></div>
      <div
        className="cart-drawer"
        style={{
          zIndex: 1060,
          background: '#ffffff',
          borderLeft: '1px solid #e2e8f0',
          boxShadow: '-10px 0 40px rgba(15, 23, 42, 0.08)',
          color: '#1e293b',
          fontFamily: '"Outfit", "Inter", sans-serif'
        }}
      >
        {/* Header */}
        <div
          className="cart-header"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            padding: '24px 28px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.25px' }}>
            Shopping Cart ({cartItems.length})
          </h3>
          <button
            onClick={onClose}
            aria-label="Close Cart"
            style={{
              background: '#f1f5f9', border: 'none', borderRadius: '50%',
              width: '36px', height: '36px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: '#475569',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Items List */}
        <div className="cart-items" style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', flex: 1 }}>
          {cartItems.length === 0 ? (
            <div className="empty-cart-message" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 500, margin: 0 }}>Your cart is empty.</p>
              <button
                className="btn btn-primary"
                onClick={onClose}
                style={{
                  padding: '10px 24px', borderRadius: '20px', fontWeight: 800, textTransform: 'uppercase',
                  boxShadow: '0 4px 10px rgba(234, 179, 8, 0.2)', border: 'none', cursor: 'pointer', backgroundColor: '#eab308', color: '#0f172a'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ca8a04'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#eab308'}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                className="cart-item animate-fade-in"
                key={item.id || item._id}
                style={{
                  display: 'flex',
                  gap: '16px',
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '20px'
                }}
              >
                {/* Image */}
                <div style={{ width: '70px', height: '70px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '4px' }}>
                  {item.image ? (
                    <img
                      src={item.image.startsWith('http') ? item.image : `${API_BASE_URL}${item.image}`}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <div className="jar-graphic" style={{ height: '56px', width: '44px', padding: '2px', borderRadius: '4px' }}>
                      <div className="jar-lid" style={{ height: '4px', width: '30px' }}></div>
                      <div className="jar-label" style={{ background: item.themeColor || '#1e293b', marginTop: '2px', padding: '2px' }}>
                        <span style={{ fontSize: '0.35rem', color: '#fff', display: 'block', lineHeight: 1 }}>
                          {item.name.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h4>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>{item.subtitle}</div>
                  {(item.selectedFlavour || item.flavour) && (
                    <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 800 }}>
                      {item.category === 'accessories' ? 'Color / Variant' : 'Flavour'}: {item.selectedFlavour || item.flavour}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '20px', padding: '2px 8px', gap: '10px' }}>
                      <button onClick={() => onUpdateQty(item.id || item._id, item.quantity - 1, item.selectedFlavour || item.flavour)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontWeight: 'bold', fontSize: '1rem', padding: '0 4px' }}>-</button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{item.quantity}</span>
                      <button onClick={() => onUpdateQty(item.id || item._id, item.quantity + 1, item.selectedFlavour || item.flavour)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontWeight: 'bold', fontSize: '1rem', padding: '0 4px' }}>+</button>
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>₹{formatPrice(item.price * item.quantity)}</div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id || item._id, item.selectedFlavour || item.flavour)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, padding: 0, alignSelf: 'flex-start', marginTop: '8px',
                      display: 'flex', alignItems: 'center', gap: '3px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#b91c1c'}
                    onMouseLeave={e => e.currentTarget.style.color = '#ef4444'}
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div
            className="cart-summary"
            style={{
              padding: '24px 28px',
              borderTop: '1px solid #f1f5f9',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {/* ── Coupon Section ── */}
            {appliedPromo ? (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.82rem'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534' }}>
                  <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
                  <span><strong>{appliedPromo.code}</strong> Applied ({discountLabel})</span>
                </span>
                <button
                  onClick={handleRemovePromo}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 800, fontSize: '0.82rem' }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                {/* Code input row */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value); setPromoError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                    disabled={promoLoading}
                    style={{
                      flex: 1, height: '40px', padding: '0 12px', background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#0f172a', outline: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase'
                    }}
                    onFocus={e => e.target.style.borderColor = '#eab308'}
                    onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                  />
                  <button
                    onClick={() => handleApplyPromo()}
                    disabled={promoLoading || !promoCode.trim()}
                    style={{
                      height: '40px', padding: '0 16px', borderRadius: '10px', fontWeight: 800, textTransform: 'uppercase',
                      backgroundColor: '#eab308', color: '#0f172a', border: 'none', cursor: 'pointer', fontSize: '0.8rem'
                    }}
                  >
                    {promoLoading ? '...' : 'Apply'}
                  </button>
                </div>

                {/* Available offers toggle */}
                {availableOffers.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <button
                      onClick={() => setShowOffers(v => !v)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px',
                        fontSize: '0.78rem', color: '#d97706', fontWeight: 800, padding: '2px 0'
                      }}
                    >
                      <Tag size={12} />
                      {showOffers ? 'Hide Available Coupons' : `View Coupons (${availableOffers.length})`}
                      {showOffers ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    {showOffers && (
                      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '120px', overflowY: 'auto', paddingRight: '2px' }}>
                        {availableOffers.map(offer => (
                          <div
                            key={offer._id}
                            style={{
                              background: '#f8fafc',
                              border: '1px dashed #cbd5e1',
                              borderRadius: '10px',
                              padding: '10px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '10px'
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                {offer.discountType === 'percentage'
                                  ? <Percent size={12} style={{ color: '#d97706', flexShrink: 0 }} />
                                  : <IndianRupee size={12} style={{ color: '#d97706', flexShrink: 0 }} />
                                }
                                <span style={{
                                  fontFamily: 'monospace', fontWeight: 900, letterSpacing: '1px',
                                  fontSize: '0.82rem', color: '#d97706'
                                }}>
                                  {offer.code}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4, fontWeight: 500 }}>
                                {offer.title} — {offer.discountType === 'percentage' ? `${offer.discountValue}% off` : `₹${offer.discountValue} off`}
                              </div>
                            </div>
                            <button
                              onClick={() => handleApplyPromo(offer.code)}
                              style={{
                                padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', fontWeight: 700,
                                backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', cursor: 'pointer'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                            >
                              Apply
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {promoError && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '4px 0 0', fontWeight: 600 }}>
                {promoError}
              </p>
            )}

            {/* Price breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '14px', fontSize: '0.85rem', color: '#475569' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#22c55e', fontWeight: 600 }}>
                  <span>Discount ({appliedPromo.code})</span>
                  <span>-₹{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Delivery Charges</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>
                  {deliveryCharges === 0 ? (
                    <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                      FREE (First Order)
                    </span>
                  ) : (
                    `₹${formatPrice(deliveryCharges)}`
                  )}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 900, color: '#d97706', paddingTop: '8px', borderTop: '1px solid #cbd5e1', marginTop: '4px' }}>
                <span>Estimated Total</span>
                <span>₹{formatPrice(finalTotal)}/-</span>
              </div>
            </div>

            {/* Auth nudge */}
            {!user && cartItems.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '12px', padding: '12px 14px', alignItems: 'center' }}>
                <LogIn size={18} style={{ color: '#b45309', flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#92400e', fontWeight: 800 }}>Sign in to Checkout</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '#0.72rem', color: '#b45309', fontWeight: 500, lineHeight: 1.3 }}>Log in or create a free account to place orders.</p>
                </div>
              </div>
            )}

            {/* Action button */}
            <button
              className="btn btn-primary"
              style={{
                width: '100%', padding: '14px 20px', borderRadius: '30px', fontWeight: 800, textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                backgroundColor: '#eab308', color: '#0f172a', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(234, 179, 8, 0.2)'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ca8a04'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#eab308'}
              onClick={() => {
                const details = { subtotal, discountAmount, deliveryCharges, finalTotal, appliedPromo };
                if (!user) { onRequireLogin(details); return; }
                onCheckout(details);
              }}
            >
              {user
                ? <><span>Secure Checkout</span><ArrowRight size={16} /></>
                : <><LogIn size={16} /><span>Sign In to Checkout</span></>
              }
            </button>
          </div>
        )}
      </div>
    </>
  );
}
