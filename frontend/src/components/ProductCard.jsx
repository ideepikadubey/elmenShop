import React from 'react';
import { Plus, Heart } from 'lucide-react';
import { API_BASE_URL } from "../config/api";

export default function ProductCard({
  product,
  isWishlisted = false,
  onToggleWishlist,
  onAddToCart,
  onQuickView
}) {
  // Format price helper
  const formatPrice = (amount) => {
    return amount.toLocaleString('en-IN');
  };

  const isOutOfStock = product.stock !== undefined && Number(product.stock) <= 0;

  const handleCardClick = (e) => {
    // If user clicked heart or add button, don't trigger card click modal
    if (e.target.closest('button')) return;
    if (onQuickView) onQuickView(product);
  };

  return (
    <div
      className="product-card animate-fade-in"
      style={{ position: 'relative', opacity: isOutOfStock ? 0.85 : 1, cursor: 'pointer' }}
      onClick={handleCardClick}
    >
      {isOutOfStock ? (
        <div
          className="product-badge"
          style={{
            backgroundColor: '#dc2626',
            color: '#ffffff',
            fontWeight: 900,
            letterSpacing: '0.5px',
            boxShadow: '0 4px 10px rgba(220, 38, 38, 0.3)'
          }}
        >
          OUT OF STOCK
        </div>
      ) : (
        product.badge && <div className="product-badge">{product.badge}</div>
      )}

      {/* Floating Wishlist Heart icon */}
      {onToggleWishlist && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id || product._id);
          }}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: isWishlisted ? 'rgba(231,76,60,0.15)' : 'rgba(21, 21, 21, 0.7)',
            border: isWishlisted ? '1px solid rgba(231,76,60,0.4)' : 'none',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.2s ease',
            color: isWishlisted ? '#e74c3c' : '#fff'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; if (!isWishlisted) e.currentTarget.style.color = '#e74c3c'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; if (!isWishlisted) e.currentTarget.style.color = '#fff'; }}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart size={16} fill={isWishlisted ? '#e74c3c' : 'none'} />
        </button>
      )}

      <div className="product-card-image">
        {product.image ? (
          <img
            src={product.image.startsWith('http') ? product.image : `${API_BASE_URL}${product.image}`}
            alt={product.name}
            style={{ height: '190px', width: 'auto', maxWidth: '100%', objectFit: 'contain', filter: isOutOfStock ? 'grayscale(40%)' : 'none' }}
          />
        ) : (
          <div className="jar-graphic" style={{ height: '180px', width: '135px', padding: '12px 10px', borderRadius: '10px' }}>
            <div className="jar-lid" style={{ height: '14px', width: '100px' }}></div>
            <div className="jar-label" style={{ background: product.themeColor || 'var(--bg-dark-700)', marginTop: '12px', padding: '8px 6px' }}>
              <div className="jar-brand" style={{ fontSize: '0.65rem' }}>EL <span style={{ color: 'var(--primary-red)' }}>MEN</span></div>
              <div className="jar-title" style={{ fontSize: '0.8rem', margin: '6px 0', color: '#fff' }}>{product.name.split(' ')[0]}</div>
              <div className="jar-stats" style={{ fontSize: '0.55rem', padding: '3px' }}>
                {product.weight.split(' ')[0]}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="product-card-info">
        <div className="product-card-subtitle">{product.subtitle}</div>
        <h3 className="product-card-title">{product.name}</h3>

        <div className="product-card-specs">
          {product.category !== 'accessories' ? (
            <>
              {product.weight && <span className="spec-badge">{product.weight}</span>}
              {product.servingsCount > 0 && <span className="spec-badge">Servings: {product.servingsCount}</span>}
              {parseInt(product.protein) > 0 && (
                <span className="spec-badge" style={{ borderColor: 'var(--primary-yellow)', color: 'var(--primary-yellow)' }}>
                  Protein: {product.protein}
                </span>
              )}
            </>
          ) : (
            <>
              {product.weight && <span className="spec-badge">{product.weight}</span>}
              {product.servingSize && <span className="spec-badge">{product.servingSize}</span>}
            </>
          )}
        </div>

        {/* Flavours / Colors Badge Bar */}
        {(() => {
          const defaultCategoryFlavours = {
            gainers: ['Malai Kulfi', 'Chocolate'],
            proteins: ['Kesar Badam', 'Cookies & Cream', 'Chocolate', 'Malai Kulfi']
          };
          const availableFlavours = Array.isArray(product.flavours) && product.flavours.length > 0
            ? product.flavours
            : (defaultCategoryFlavours[product.category] || []);

          if (availableFlavours.length === 0) return null;

          const isAccessory = product.category === 'accessories';

          return (
            <div style={{ marginTop: '10px', marginBottom: '8px' }}>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'var(--text-gray)',
                letterSpacing: '0.5px',
                display: 'block',
                marginBottom: '6px'
              }}>
                {isAccessory ? '🎨 Colors / Options:' : '🍦 Flavours:'}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {availableFlavours.slice(0, 3).map((flv, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      background: 'var(--bg-dark-700)',
                      color: 'var(--primary-yellow)',
                      border: '1px solid rgba(255, 190, 0, 0.25)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {flv}
                  </span>
                ))}
                {availableFlavours.length > 3 && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      background: 'var(--bg-dark-800)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--bg-dark-600)'
                    }}
                  >
                    +{availableFlavours.length - 3} More
                  </span>
                )}
              </div>
            </div>
          );
        })()}

        <p className="product-card-desc">{product.details}</p>
      </div>

      <div className="product-card-footer">
        {(() => {
          const discountPrice = Number(product.price || 0);
          const originalMrp = Number(product.originalPrice || 0);
          const hasDiscount = discountPrice > 0 && originalMrp > 0 && discountPrice < originalMrp;
          const displayPrice = hasDiscount ? discountPrice : (originalMrp > 0 ? originalMrp : discountPrice);

          return (
            <div className="price-container">
              {hasDiscount && (
                <span className="price-original">₹{formatPrice(originalMrp)}</span>
              )}
              <span className="price-actual">₹{formatPrice(displayPrice)}<span>/-</span></span>
            </div>
          );
        })()}

        <div className="card-actions" style={{ width: '100%' }}>
          <button
            className="btn btn-primary"
            disabled={isOutOfStock}
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: '0.78rem',
              backgroundColor: isOutOfStock ? '#64748b' : undefined,
              borderColor: isOutOfStock ? '#64748b' : undefined,
              color: isOutOfStock ? '#ffffff' : undefined,
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              opacity: isOutOfStock ? 0.8 : 1
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!isOutOfStock) onAddToCart(product);
            }}
          >
            {isOutOfStock ? 'OUT OF STOCK' : <><Plus size={16} /> Add to Cart</>}
          </button>
        </div>
      </div>
    </div>
  );
}
