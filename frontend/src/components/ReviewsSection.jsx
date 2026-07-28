import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, ChevronLeft, ChevronRight, Quote, PenLine, Send, X, Loader2, MessageSquare } from 'lucide-react';
import { API_BASE_URL } from "../config/api";

function StarRating({ rating, interactive = false, onRate }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-rating" style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={interactive ? 22 : 15}
          className={star <= (interactive ? (hovered || rating) : rating) ? 'star-filled' : 'star-empty'}
          style={{ cursor: interactive ? 'pointer' : 'default', transition: 'transform 0.1s' }}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate && onRate(star)}
        />
      ))}
    </div>
  );
}

function getInitials(name = '') {
  return name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

const AVATAR_COLORS = [
  '#e74c3c', '#e67e22', '#f39c12', '#27ae60', '#16a085',
  '#2980b9', '#8e44ad', '#c0392b', '#d35400',
];
function avatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function ReviewsSection({ user, productsList = [] }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ productId: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const reviewsPerPage = 3;

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/reviews`);
      if (res.data.success) setReviews(res.data.reviews);
    } catch {
      // stay with empty array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  // Reset page when reviews change
  useEffect(() => { setCurrentPage(0); }, [reviews.length]);

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const visibleReviews = reviews.slice(currentPage * reviewsPerPage, currentPage * reviewsPerPage + reviewsPerPage);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0';

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!formData.productId) { setFormError('Please select a product.'); return; }
    if (!formData.comment.trim()) { setFormError('Please write your review.'); return; }
    if (formData.comment.trim().length < 20) { setFormError('Review must be at least 20 characters.'); return; }

    setSubmitting(true);
    setFormError('');
    try {
      const token = localStorage.getItem('elmen_token');
      await axios.post(`${API_BASE_URL}/api/reviews`, {
        productId: formData.productId,
        rating: formData.rating,
        comment: formData.comment.trim(),
      }, { headers: { Authorization: `Bearer ${token}` } });

      setFormSuccess(true);
      setFormData({ productId: '', rating: 5, comment: '' });
      fetchReviews(); // refresh list
      setTimeout(() => { setFormSuccess(false); setShowForm(false); }, 2500);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="reviews-section" id="reviews">
      <div className="container">

        {/* ── Header ── */}
        <div className="section-header">
          <h2>What Our <span>Customers Say</span></h2>
          <p>Real results from real athletes. Verified purchases only.</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 size={32} style={{ color: 'var(--primary-yellow)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : reviews.length === 0 ? (
          /* ── Empty State ── */
          <div style={{
            textAlign: 'center', padding: '60px 24px',
            background: 'var(--bg-dark-800)', borderRadius: '16px',
            border: '1px dashed var(--bg-dark-600)', marginBottom: '32px'
          }}>
            <MessageSquare size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontWeight: 800, marginBottom: '8px' }}>No reviews yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Be the first to share your experience!</p>
          </div>
        ) : (
          <>
            {/* ── Aggregate Rating Bar ── */}
            <div className="reviews-aggregate">
              <div className="agg-score">{avgRating}</div>
              <div className="agg-info">
                <StarRating rating={Math.round(Number(avgRating))} />
                <p>Based on {reviews.length} verified {reviews.length === 1 ? 'review' : 'reviews'}</p>
              </div>
              <div className="agg-bars">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter(r => r.rating === star).length;
                  const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                  return (
                    <div className="agg-bar-row" key={star}>
                      <span>{star} ★</span>
                      <div className="agg-bar-track">
                        <div className="agg-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Review Cards ── */}
            <div className="reviews-grid">
              {visibleReviews.map((review) => {
                const name = review.userName || 'Anonymous';
                const product = review.product?.name || 'EL MEN Product';
                const date = new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

                return (
                  <div className="review-card" key={review._id}>
                    <Quote size={24} className="review-quote-icon" />
                    <p className="review-text">"{review.comment}"</p>
                    <div className="review-meta">
                      <StarRating rating={review.rating} />
                      <span className="review-product">— {product}</span>
                    </div>
                    <div className="review-author">
                      <div
                        className="review-avatar"
                        style={{ background: avatarColor(name), color: '#fff' }}
                      >
                        {getInitials(name)}
                      </div>
                      <div>
                        <div className="review-name">
                          {name}
                          <span className="verified-badge">✓ Verified</span>
                        </div>
                        <div className="review-location">{date}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="reviews-pagination">
                <button
                  className="review-nav-btn"
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 0))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={`review-dot ${currentPage === i ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i)}
                  />
                ))}
                <button
                  className="review-nav-btn"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages - 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Write a Review CTA ── */}
        <div style={{ textAlign: 'center', marginTop: reviews.length > 0 ? '32px' : '0' }}>
          {user ? (
            <button
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}
              onClick={() => { setShowForm(v => !v); setFormError(''); setFormSuccess(false); }}
            >
              <PenLine size={16} />
              {showForm ? 'Cancel' : 'Write a Review'}
            </button>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <a href="#" style={{ color: 'var(--primary-yellow)', fontWeight: 700 }} onClick={e => { e.preventDefault(); window.dispatchEvent(new CustomEvent('elmen:openAuth')); }}>
                Sign in
              </a> to share your experience
            </p>
          )}
        </div>

        {/* ── Review Form ── */}
        {showForm && user && (
          <div
            className="animate-fade-in"
            style={{
              marginTop: '24px', background: 'var(--bg-dark-800)',
              border: '1px solid var(--bg-dark-700)', borderRadius: '16px', padding: '28px',
              maxWidth: '600px', margin: '24px auto 0'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Share Your Experience
              </h3>
              <button
                onClick={() => setShowForm(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {formSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(39,174,96,0.12)', border: '1px solid rgba(39,174,96,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Star size={24} style={{ color: '#27ae60' }} />
                </div>
                <h4 style={{ fontWeight: 800, marginBottom: '4px' }}>Thank you for your review!</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Your review has been published successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Product selector */}
                <div className="form-group">
                  <label>Select Product</label>
                  <select
                    className="form-input"
                    value={formData.productId}
                    onChange={e => setFormData({ ...formData, productId: e.target.value })}
                    style={{ appearance: 'auto' }}
                  >
                    <option value="">— Choose a product —</option>
                    {productsList.map(p => (
                      <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Star rating picker */}
                <div className="form-group">
                  <label>Your Rating</label>
                  <StarRating
                    rating={formData.rating}
                    interactive
                    onRate={star => setFormData({ ...formData, rating: star })}
                  />
                </div>

                {/* Review text */}
                <div className="form-group">
                  <label>Your Review</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="Share what you liked, your results, and would you recommend it..."
                    value={formData.comment}
                    onChange={e => setFormData({ ...formData, comment: e.target.value })}
                    style={{ resize: 'vertical', minHeight: '100px' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {formData.comment.length} / minimum 20 characters
                  </span>
                </div>

                {formError && (
                  <div style={{ color: '#ff6b6b', fontSize: '0.82rem', background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.25)', borderRadius: '8px', padding: '10px' }}>
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  disabled={submitting}
                >
                  {submitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
                  {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}
