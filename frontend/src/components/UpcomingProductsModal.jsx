import React, { useState, useEffect } from 'react';
import { X, Bell, Droplet, Shirt, Sparkles, CheckCircle2, Star, Clock, Shield, ArrowRight } from 'lucide-react';

const UPCOMING_CATEGORIES = [
  { key: 'all', label: 'All Upcoming', icon: Sparkles },
  { key: 'perfumes', label: 'Perfumes', icon: Droplet, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
  { key: 'ayurveda', label: 'Ayurveda', icon: Shield, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
  { key: 'clothing', label: 'Clothing', icon: Shirt, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
];

const UPCOMING_PRODUCTS = [
  {
    id: 'up-p1',
    category: 'perfumes',
    name: 'EL MEN Oud Royale EDP',
    subtitle: '50ml Concentrated Perfume Spray',
    badge: 'Formulation Finalized',
    badgeColor: '#fbbf24',
    launchDate: 'Launching Q4 2026',
    desc: 'Rich Cambodian Oud blended with Kashmiri Saffron, Dark Amber, and Smoked Vanilla. Built for long-lasting 24-hour fragrance projection.',
    notes: ['Saffron & Spices', 'Cambodian Royal Oud', 'Amber & Vanilla Wood'],
    gradient: 'linear-gradient(135deg, #2a1b08 0%, #0d0803 100%)',
    border: 'rgba(251, 191, 36, 0.3)'
  },
  {
    id: 'up-p2',
    category: 'perfumes',
    name: 'EL MEN Velvet Intense Night EDP',
    subtitle: '100ml Eau De Parfum',
    badge: 'In Quality Testing',
    badgeColor: '#f59e0b',
    launchDate: 'Launching Q4 2026',
    desc: 'An magnetic evening fragrance featuring Italian Bergamot, Crisp Cedar, Black Pepper, and Sensual Musk.',
    notes: ['Italian Bergamot', 'Black Pepper Spice', 'Crisp Cedar & Leather'],
    gradient: 'linear-gradient(135deg, #1c152a 0%, #0a0614 100%)',
    border: 'rgba(168, 85, 247, 0.3)'
  },
  {
    id: 'up-a1',
    category: 'ayurveda',
    name: 'EL MEN Pure Himalayan Shilajit Gold',
    subtitle: '25g 100% Resin Form with Gold Flakes',
    badge: 'Lab Batch Verified',
    badgeColor: '#22c55e',
    launchDate: 'Launching Q4 2026',
    desc: 'Sourced from 18,000+ ft altitude in the High Himalayas. Rich in 84+ minerals and 75% Fulvic Acid for natural stamina and vigor.',
    notes: ['84+ Ionic Minerals', '75% Fulvic Acid', 'Pure Swarna Bhasma'],
    gradient: 'linear-gradient(135deg, #092615 0%, #021209 100%)',
    border: 'rgba(34, 197, 94, 0.3)'
  },
  {
    id: 'up-a2',
    category: 'ayurveda',
    name: 'EL MEN Ashwagandha KSM-66 Max',
    subtitle: '60 Full-Spectrum Veg Capsules',
    badge: 'Clinical Trial Phase',
    badgeColor: '#10b981',
    launchDate: 'Launching Q4 2026',
    desc: 'Highest concentration root-only extract for muscle strength, cortisol balance, stress relief, and deep sleep recovery.',
    notes: ['KSM-66 Organic Extract', 'Zero Fillers / 100% Pure', 'Enhanced Bioavailability'],
    gradient: 'linear-gradient(135deg, #0f241a 0%, #05120c 100%)',
    border: 'rgba(16, 185, 129, 0.3)'
  },
  {
    id: 'up-c1',
    category: 'clothing',
    name: 'EL MEN Heavyweight Oversized Tee',
    subtitle: '240 GSM 100% Combed Cotton',
    badge: 'Sample Prototype Ready',
    badgeColor: '#3b82f6',
    launchDate: 'Launching Q4 2026',
    desc: 'Engineered for gym wear and casual street style. Preshrunk, breathable heavyweight fabric with reinforced high-density collar.',
    notes: ['240 GSM Heavy Cotton', 'Anti-Pilling Finish', 'Drop Shoulder Fit'],
    gradient: 'linear-gradient(135deg, #0f1c30 0%, #060b14 100%)',
    border: 'rgba(59, 130, 246, 0.3)'
  },
  {
    id: 'up-c2',
    category: 'clothing',
    name: 'EL MEN Pro-Fit Compression Shorts',
    subtitle: '4-Way Stretch Performance Shorts',
    badge: 'Fabric Rigor Testing',
    badgeColor: '#60a5fa',
    launchDate: 'Launching Q4 2026',
    desc: 'Moisture-wicking inner compression liner with hidden phone pocket and 2-in-1 elastic waistband for intense workout sessions.',
    notes: ['Moisture-Wicking Tech', 'Dual Phone Pockets', 'Anti-Chafing Seams'],
    gradient: 'linear-gradient(135deg, #111e38 0%, #050c18 100%)',
    border: 'rgba(96, 165, 250, 0.3)'
  }
];

export default function UpcomingProductsModal({ isOpen, initialCategory = 'all', onClose }) {
  const [selectedTab, setSelectedTab] = useState('all');
  const [emailInput, setEmailInput] = useState('');
  const [notifiedProducts, setNotifiedProducts] = useState([]);
  const [generalSubscribed, setGeneralSubscribed] = useState(false);

  useEffect(() => {
    if (initialCategory) {
      setSelectedTab(initialCategory);
    }
  }, [initialCategory, isOpen]);

  if (!isOpen) return null;

  const filteredProducts = selectedTab === 'all'
    ? UPCOMING_PRODUCTS
    : UPCOMING_PRODUCTS.filter(p => p.category === selectedTab);

  const handleNotifyProduct = (id) => {
    if (!notifiedProducts.includes(id)) {
      setNotifiedProducts([...notifiedProducts, id]);
    }
  };

  const handleGeneralSubscribe = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setGeneralSubscribed(true);
    setEmailInput('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        style={{
          backgroundColor: '#0a0a0a',
          border: '1px solid var(--bg-dark-600)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          overflowY: 'auto',
          color: '#ffffff',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
          position: 'relative',
          padding: '36px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'var(--bg-dark-700)',
            border: '1px solid var(--bg-dark-600)',
            color: '#94a3b8',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.background = 'var(--primary-red)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.background = 'var(--bg-dark-700)';
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 190, 0, 0.12)', border: '1px solid rgba(255, 190, 0, 0.3)', color: 'var(--primary-yellow)', padding: '6px 16px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
            <Sparkles size={14} /> Official Launch Roadmap
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
            Upcoming <span style={{ color: 'var(--primary-yellow)' }}>Collections</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '560px', margin: '10px auto 0', lineHeight: '1.5' }}>
            Be the first to know when our new luxury fragrances, natural wellness formulations, and performance apparel hit the shelves.
          </p>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
          {UPCOMING_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedTab === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedTab(cat.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '30px',
                  border: isActive ? '1.5px solid var(--primary-yellow)' : '1px solid var(--bg-dark-600)',
                  background: isActive ? 'var(--primary-yellow)' : 'var(--bg-dark-700)',
                  color: isActive ? '#000000' : '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} color={isActive ? '#000000' : (cat.color || 'var(--primary-yellow)')} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '36px' }}>
          {filteredProducts.map((p) => {
            const isNotified = notifiedProducts.includes(p.id);
            return (
              <div
                key={p.id}
                style={{
                  background: p.gradient,
                  border: `1px solid ${p.border}`,
                  borderRadius: '18px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
                  transition: 'transform 0.25s ease'
                }}
              >
                <div>
                  {/* Top Badge Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, background: 'rgba(255,255,255,0.08)', color: p.badgeColor, padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', border: `1px solid ${p.border}` }}>
                      {p.badge}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                      <Clock size={12} /> {p.launchDate}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: '0 0 4px 0' }}>
                    {p.name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '12px' }}>
                    {p.subtitle}
                  </div>

                  <p style={{ fontSize: '0.83rem', color: '#94a3b8', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                    {p.desc}
                  </p>

                  {/* Highlights / Notes */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {p.notes.map((note, idx) => (
                      <span key={idx} style={{ fontSize: '0.7rem', color: '#e2e8f0', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        ✓ {note}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notify Me Button */}
                <button
                  onClick={() => handleNotifyProduct(p.id)}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: isNotified ? '1.5px solid #22c55e' : '1px solid var(--bg-dark-600)',
                    background: isNotified ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    color: isNotified ? '#4ade80' : '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isNotified ? (
                    <>
                      <CheckCircle2 size={16} /> Notification Activated
                    </>
                  ) : (
                    <>
                      <Bell size={16} style={{ color: 'var(--primary-yellow)' }} /> Notify Me On Launch
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* General VIP Early Access Subscription Footer */}
        <div style={{ background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)', border: '1px solid var(--bg-dark-600)', borderRadius: '18px', padding: '28px', textAlign: 'center' }}>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
            🎁 Get Exclusive VIP Early Access & 20% OFF
          </h4>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '500px', margin: '0 auto 16px' }}>
            Subscribe with your email or phone number to receive early access link 24 hours before public launch.
          </p>

          {generalSubscribed ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#4ade80', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', padding: '10px 24px', borderRadius: '30px', fontWeight: 800, fontSize: '0.9rem' }}>
              <CheckCircle2 size={18} /> You are on the VIP Launch List! We will notify you first.
            </div>
          ) : (
            <form onSubmit={handleGeneralSubscribe} style={{ display: 'flex', gap: '10px', maxWidth: '480px', margin: '0 auto' }}>
              <input
                type="text"
                required
                placeholder="Enter email or mobile number..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  borderRadius: '30px',
                  border: '1px solid var(--bg-dark-600)',
                  background: '#0a0a0a',
                  color: '#ffffff',
                  outline: 'none',
                  fontSize: '0.88rem'
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ borderRadius: '30px', padding: '12px 24px', fontWeight: 900, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                Join VIP List <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
