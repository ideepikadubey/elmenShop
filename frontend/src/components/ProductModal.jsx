import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, CheckCircle, ShieldAlert, Star } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from "../config/api";

export default function ProductModal({ product, onClose, onAddToCart }) {
  if (!product) return null;

  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeImage, setActiveImage] = useState(product.image || '');
  const [selectedFlavour, setSelectedFlavour] = useState('');

  const fetchReviews = async () => {
    try {
      const pid = product._id || product.id;
      const res = await axios.get(`${API_BASE_URL}/api/reviews/product/${pid}`);
      if (res.data.success) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
    setActiveImage(product.image || '');
    const defaultFlvs = Array.isArray(product.flavours) && product.flavours.length > 0
      ? product.flavours
      : (product.category === 'gainers' ? ['Malai Kulfi', 'Chocolate'] : (product.category === 'proteins' ? ['Kesar Badam', 'Cookies & Cream', 'Chocolate', 'Malai Kulfi'] : []));
    setSelectedFlavour(defaultFlvs[0] || '');
  }, [product]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('elmen_token');
      if (!token) {
        setErrorMsg('Please login to submit a review.');
        setIsSubmitting(false);
        return;
      }

      const pid = product._id || product.id;
      const res = await axios.post(`${API_BASE_URL}/api/reviews`, {
        productId: pid,
        rating: newRating,
        comment: newComment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setSuccessMsg('Thank you! Review submitted successfully.');
        setNewComment('');
        setNewRating(5);
        fetchReviews();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (amount) => {
    return amount.toLocaleString('en-IN');
  };

  const getDirections = (category) => {
    switch (category) {
      case 'proteins':
        return "Add 1 scoop of Clean Whey (approx. 33g) to 200-240ml of cold water or skimmed milk. Blend or shake for 30 seconds until fully dissolved. For best results, consume within 30 minutes post-workout.";
      case 'gainers':
        return "Mix 2 scoops of Pro Gain (approx. 100g) with 350-400ml of whole milk or water in a blender. Blend with ice, bananas, or peanut butter for an extra calorie boost. Consume 1-2 times daily between meals.";
      case 'preworkouts':
        return "Mix 1 scoop of Pre-Workout in 200-250ml of cold water. Shake well and consume 15-30 minutes before training. Do not exceed 1 scoop in a 24-hour period. Stay well hydrated during your workout.";
      case 'performance':
        return "Take 1 tablet daily with a glass of water, preferably with breakfast or lunch. Do not exceed the recommended daily dose. Consult your physician if you have any pre-existing medical conditions.";
      default:
        return "Take 1 serving (as suggested on the label) with water or meals daily, or as directed by a healthcare professional. Store in a cool, dry place away from direct sunlight.";
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <div
        className="modal-content animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '850px',
          padding: '32px',
          overflow: 'hidden',
          borderRadius: '24px',
          background: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 30px 60px rgba(15, 23, 42, 0.15)',
          color: '#1e293b',
          fontFamily: '"Outfit", "Inter", sans-serif',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div className="modal-close-wrapper" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <button
            onClick={onClose}
            aria-label="Close Modal"
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

        <div className="modal-body" style={{ padding: 0 }}>
          <div className="product-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>

            {/* Left Column: Images */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              {activeImage ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '380px', backgroundColor: '#f8fafc', borderRadius: '18px', border: '1px solid #f1f5f9', padding: '16px' }}>
                  <img
                    src={activeImage.startsWith('http') ? activeImage : `${API_BASE_URL}${activeImage}`}
                    alt={product.name}
                    style={{ height: '100%', width: 'auto', maxWidth: '100%', objectFit: 'contain' }}
                  />
                </div>
              ) : (
                <div className="jar-graphic" style={{ height: '380px', width: '260px', padding: '20px 16px', margin: '0' }}>
                  <div className="jar-lid" style={{ height: '24px', width: '160px' }}></div>
                  <div className="jar-label" style={{ background: product.themeColor || 'var(--bg-dark-700)', marginTop: '24px' }}>
                    <div className="jar-brand" style={{ fontSize: '1rem' }}>EL <span style={{ color: '#fff' }}>MEN</span></div>
                    <div className="jar-title" style={{ fontSize: '1.3rem', color: '#fff', fontWeight: 800 }}>{product.name}</div>
                    <div className="jar-stats" style={{ fontSize: '0.8rem', padding: '6px 10px' }}>
                      {product.weight}
                    </div>
                  </div>
                </div>
              )}

              {/* Thumbnails strip */}
              {product.images && product.images.length > 1 && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                  {product.images.map((img, idx) => {
                    const isActive = activeImage === img;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        style={{
                          width: '56px',
                          height: '56px',
                          padding: '4px',
                          borderRadius: '10px',
                          background: '#f8fafc',
                          border: isActive ? '2.5px solid #eab308' : '1.5px solid #e2e8f0',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          transition: 'all 0.2s',
                          boxShadow: isActive ? '0 4px 10px rgba(234, 179, 8, 0.15)' : 'none'
                        }}
                      >
                        <img
                          src={img.startsWith('http') ? img : `${API_BASE_URL}${img}`}
                          alt={`${product.name} view ${idx + 1}`}
                          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Info & Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.subtitle}</span>
                <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 10px 0', letterSpacing: '-0.75px' }}>{product.name}</h2>
              </div>

              {(() => {
                const isOutOfStock = product.stock !== undefined && Number(product.stock) <= 0;
                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', margin: '8px 0' }}>
                      <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a' }}>
                        ₹{formatPrice(product.price)}/-
                      </span>
                      {product.originalPrice && (
                        <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '1.2rem', fontWeight: 500 }}>
                          ₹{formatPrice(product.originalPrice)}
                        </span>
                      )}
                      {isOutOfStock && (
                        <span style={{ backgroundColor: '#dc2626', color: '#ffffff', fontSize: '0.75rem', fontWeight: 900, padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.5px' }}>
                          OUT OF STOCK
                        </span>
                      )}
                    </div>

                    <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>{product.details}</p>

                    {/* Nutrition Supplement Facts */}
                    <div>
                      <h4 style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 800, marginBottom: '12px', color: '#d97706', letterSpacing: '0.5px' }}>
                        Supplement Facts
                      </h4>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 700 }}>Ingredient / Nutrient</th>
                            <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 700, textAlign: 'right' }}>Amt per serving</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.nutritionFacts && typeof product.nutritionFacts === 'object' && Object.entries(product.nutritionFacts).map(([key, value]) => (
                            <tr key={key} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '8px 12px', color: '#0f172a', fontWeight: 500 }}>{key}</td>
                              <td style={{ padding: '8px 12px', color: '#0f172a', fontWeight: 700, textAlign: 'right' }}>{value}</td>
                            </tr>
                          ))}
                          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '8px 12px', color: '#64748b', fontWeight: 500 }}>Serving Size</td>
                            <td style={{ padding: '8px 12px', color: '#0f172a', fontWeight: 700, textAlign: 'right' }}>{product.servingSize}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '8px 12px', color: '#64748b', fontWeight: 500 }}>Total Weight</td>
                            <td style={{ padding: '8px 12px', color: '#0f172a', fontWeight: 700, textAlign: 'right' }}>{product.weight}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Directions */}
                    <div>
                      <h4 style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 800, marginBottom: '8px', color: '#d97706', letterSpacing: '0.5px' }}>
                        Suggested Directions
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: '1.6' }}>
                        {getDirections(product.category)}
                      </p>
                    </div>

                    {/* Flavour Selector */}
                    {(() => {
                      const flavoursList = Array.isArray(product.flavours) && product.flavours.length > 0
                        ? product.flavours
                        : (product.category === 'gainers' ? ['Malai Kulfi', 'Chocolate'] : (product.category === 'proteins' ? ['Kesar Badam', 'Cookies & Cream', 'Chocolate', 'Malai Kulfi'] : []));
                      if (flavoursList.length === 0) return null;
                      return (
                        <div style={{ marginTop: '16px', marginBottom: '8px' }}>
                          <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>
                            Select Flavour: <span style={{ color: '#d97706', fontWeight: 900 }}>{selectedFlavour || flavoursList[0]}</span>
                          </label>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {flavoursList.map((flv) => {
                              const isSel = (selectedFlavour || flavoursList[0]) === flv;
                              return (
                                <button
                                  key={flv}
                                  type="button"
                                  onClick={() => setSelectedFlavour(flv)}
                                  style={{
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: 800,
                                    border: isSel ? '1.5px solid #d97706' : '1px solid #cbd5e1',
                                    backgroundColor: isSel ? '#fffbeb' : '#ffffff',
                                    color: isSel ? '#b45309' : '#475569',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  {flv}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Add to Cart Button */}
                    <button
                      className="btn btn-primary"
                      disabled={isOutOfStock}
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
                        backgroundColor: isOutOfStock ? '#64748b' : '#eab308',
                        color: isOutOfStock ? '#ffffff' : '#0f172a',
                        border: 'none',
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        boxShadow: isOutOfStock ? 'none' : '0 4px 12px rgba(234, 179, 8, 0.2)',
                        marginTop: '12px',
                        opacity: isOutOfStock ? 0.85 : 1
                      }}
                      onMouseEnter={e => !isOutOfStock && (e.currentTarget.style.backgroundColor = '#ca8a04')}
                      onMouseLeave={e => !isOutOfStock && (e.currentTarget.style.backgroundColor = '#eab308')}
                      onClick={() => {
                        if (!isOutOfStock) {
                          const defaultFlvs = Array.isArray(product.flavours) && product.flavours.length > 0
                            ? product.flavours
                            : (product.category === 'gainers' ? ['Malai Kulfi', 'Chocolate'] : (product.category === 'proteins' ? ['Kesar Badam', 'Cookies & Cream', 'Chocolate', 'Malai Kulfi'] : []));
                          const chosenFlavour = selectedFlavour || defaultFlvs[0] || '';
                          onAddToCart({ ...product, selectedFlavour: chosenFlavour });
                          onClose();
                        }
                      }}
                    >
                      {isOutOfStock ? (
                        'OUT OF STOCK'
                      ) : (
                        <><ShoppingCart size={18} /> Add to Shopping Cart</>
                      )}
                    </button>
                  </>
                );
              })()}

              {/* Reviews section */}
              <div style={{ marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                <h4 style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 800, marginBottom: '16px', color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.5px' }}>
                  ⭐ Verified Buyer Reviews ({reviews.length})
                </h4>

                {/* Review Form */}
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 'bold' }}>Rating:</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <Star
                            size={16}
                            color="#eab308"
                            fill={star <= newRating ? '#eab308' : 'none'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    placeholder="Write your verified feedback here..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '60px',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      color: '#0f172a',
                      padding: '10px',
                      fontSize: '0.85rem',
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                    onFocus={e => e.target.style.borderColor = '#eab308'}
                    onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                  />

                  {errorMsg && <div style={{ color: '#ef4444', fontSize: '0.78rem', fontWeight: 500 }}>{errorMsg}</div>}
                  {successMsg && <div style={{ color: '#22c55e', fontSize: '0.78rem', fontWeight: 500 }}>{successMsg}</div>}

                  <button
                    type="submit"
                    className="btn btn-secondary"
                    style={{
                      fontSize: '0.78rem',
                      padding: '8px 16px',
                      alignSelf: 'flex-end',
                      borderRadius: '20px',
                      fontWeight: 700,
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>

                {/* Reviews List */}
                <div style={{ display: 'grid', gap: '12px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                  {reviews.length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0', fontStyle: 'italic' }}>No reviews yet. Be the first to share your feedback!</p>
                  ) : (
                    reviews.map((rev) => (
                      <div
                        key={rev._id}
                        style={{
                          backgroundColor: '#ffffff',
                          padding: '16px',
                          borderRadius: '14px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{rev.userName}</span>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={12}
                                color="#eab308"
                                fill={star <= rev.rating ? '#eab308' : 'none'}
                              />
                            ))}
                          </div>
                        </div>
                        <p style={{ color: '#475569', fontSize: '0.82rem', margin: 0, lineHeight: '1.5' }}>{rev.comment}</p>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginTop: '6px', textAlign: 'right', fontWeight: 500 }}>
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
