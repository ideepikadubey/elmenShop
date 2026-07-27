import React from 'react';
import { Eye, Plus, Heart } from 'lucide-react';
import { API_BASE_URL, getImageUrl } from "./config/api";

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

  return (
    <div className="product-card animate-fade-in" style={{ position: 'relative', opacity: isOutOfStock ? 0.85 : 1 }}>
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
          <span className="spec-badge">{product.weight}</span>
          <span className="spec-badge">Servings: {product.servingsCount}</span>
          {parseInt(product.protein) > 0 && (
            <span className="spec-badge" style={{ borderColor: 'var(--primary-yellow)', color: 'var(--primary-yellow)' }}>
              Protein: {product.protein}
            </span>
          )}
        </div>

        <p className="product-card-desc">{product.details}</p>
      </div>

      <div className="product-card-footer">
        <div className="price-container">
          <span className="price-original">₹{formatPrice(product.originalPrice)}</span>
          <span className="price-actual">₹{formatPrice(product.price)}<span>/-</span></span>
        </div>

        <div className="card-actions">
          <button
            className="btn-icon"
            onClick={() => onQuickView(product)}
            title="Quick View"
            aria-label="Quick View"
          >
            <Eye size={18} />
          </button>
          <button
            className="btn btn-primary"
            disabled={isOutOfStock}
            style={{
              padding: '10px 14px',
              fontSize: '0.78rem',
              backgroundColor: isOutOfStock ? '#64748b' : undefined,
              borderColor: isOutOfStock ? '#64748b' : undefined,
              color: isOutOfStock ? '#ffffff' : undefined,
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              opacity: isOutOfStock ? 0.8 : 1
            }}
            onClick={() => !isOutOfStock && onAddToCart(product)}
          >
            {isOutOfStock ? 'OUT OF STOCK' : <><Plus size={16} /> Add</>}
          </button>
        </div>
      </div>
    </div>
  );
}
