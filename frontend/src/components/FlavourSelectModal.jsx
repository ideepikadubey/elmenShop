import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Check, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function FlavourSelectModal({ product, onClose, onConfirm }) {
  if (!product) return null;

  const isAccessory = product.category === 'accessories';
  const defaultCategoryFlavours = {
    gainers: ['Malai Kulfi', 'Chocolate'],
    proteins: ['Kesar Badam', 'Cookies & Cream', 'Chocolate', 'Malai Kulfi'],
    accessories: ['Navy Blue', 'Black', 'Grey']
  };

  const availableFlavours = Array.isArray(product.flavours) && product.flavours.length > 0
    ? product.flavours
    : (defaultCategoryFlavours[product.category] || (isAccessory ? ['Navy Blue', 'Black', 'Grey'] : ['Chocolate', 'Vanilla']));

  const [selectedFlavour, setSelectedFlavour] = useState(availableFlavours[0] || '');

  useEffect(() => {
    if (availableFlavours.length > 0) {
      setSelectedFlavour(availableFlavours[0]);
    }
  }, [product]);

  const handleConfirm = () => {
    onConfirm(product, selectedFlavour);
    onClose();
  };

  const formatPrice = (amount) => amount ? amount.toLocaleString('en-IN') : '0';

  return (
    <div
      className="modal-overlay animate-fade-in"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="modal-content animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          fontFamily: '"Outfit", "Inter", sans-serif',
          color: '#0f172a'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute', top: '20px', right: '20px',
            background: '#f1f5f9', border: 'none', borderRadius: '50%',
            width: '36px', height: '36px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: '#475569',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
        >
          <X size={18} />
        </button>

        {/* Product mini header */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ width: '65px', height: '65px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '4px' }}>
            {product.image ? (
              <img src={product.image.startsWith('http') ? product.image : `${API_BASE_URL}${product.image}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <Sparkles size={24} style={{ color: '#eab308' }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {product.name}
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
              {product.subtitle}
            </p>
            <div style={{ marginTop: '4px', fontSize: '0.95rem', fontWeight: 900, color: '#d97706' }}>
              ₹{formatPrice((product.price && Number(product.price) > 0) ? Number(product.price) : Number(product.originalPrice || 0))}
            </div>
          </div>
        </div>

        {/* Flavour / Color selection title */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', display: 'block', marginBottom: '10px', letterSpacing: '0.5px' }}>
            {isAccessory ? 'Select Preferred Color / Variant:' : 'Select Preferred Flavour:'}
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {availableFlavours.map((flv) => {
              const isSelected = selectedFlavour === flv;
              return (
                <button
                  key={flv}
                  type="button"
                  onClick={() => setSelectedFlavour(flv)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    border: isSelected ? '2px solid #eab308' : '1.5px solid #cbd5e1',
                    backgroundColor: isSelected ? '#fffbeb' : '#f8fafc',
                    color: isSelected ? '#b45309' : '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                >
                  <span>{flv}</span>
                  {isSelected && (
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#eab308', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleConfirm}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: '30px',
            fontWeight: 800,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#eab308',
            color: '#0f172a',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(234, 179, 8, 0.3)',
            fontSize: '0.88rem',
            marginTop: '20px'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ca8a04'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#eab308'}
        >
          <ShoppingCart size={18} />
          <span>Confirm & Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
