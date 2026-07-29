import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Activity, Heart, ChevronLeft, ChevronRight, FlaskConical } from 'lucide-react';

const USFlagIcon = () => (
  <svg width="32" height="22" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '4px', boxShadow: '0 3px 8px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.5)', display: 'inline-block' }}>
    <rect width="28" height="20" fill="#B22234" rx="2" />
    <rect y="2.2" width="28" height="2.2" fill="white" />
    <rect y="6.6" width="28" height="2.2" fill="white" />
    <rect y="11" width="28" height="2.2" fill="white" />
    <rect y="15.4" width="28" height="2.2" fill="white" />
    <rect width="12" height="11" fill="#3C3B6E" />
    <circle cx="2.5" cy="2.5" r="0.75" fill="white" />
    <circle cx="6" cy="2.5" r="0.75" fill="white" />
    <circle cx="9.5" cy="2.5" r="0.75" fill="white" />
    <circle cx="4.25" cy="5.5" r="0.75" fill="white" />
    <circle cx="7.75" cy="5.5" r="0.75" fill="white" />
    <circle cx="2.5" cy="8.5" r="0.75" fill="white" />
    <circle cx="6" cy="8.5" r="0.75" fill="white" />
    <circle cx="9.5" cy="8.5" r="0.75" fill="white" />
  </svg>
);

export default function Hero({ onShopClick }) {
  const slides = [
    { url: '/a.png', alt: 'EL MEN Nutrition Performance Whey' },
    { url: '/b.png', alt: 'Science-Backed Nutrition For Every Goal' },
    { url: '/c.png', alt: 'Premium Protein Recovery & Muscle Growth' },
    { url: '/d.png', alt: 'Testo One & Everyday Wellness Tablets' },
    { url: '/test.png', alt: 'EL MEN Testo Booster Formula' },
    { url: '/strenght.png', alt: 'EL MEN Maximum Strength & Stamina' }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="hero-section" style={{ position: 'relative' }}>
      {/* Interactive Hero Banner Carousel */}
      <div className="hero-carousel-container" style={{ position: 'relative', overflow: 'hidden' }}>
        <div
          className="hero-slides-track"
          style={{
            display: 'flex',
            transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
            transform: `translateX(-${currentSlide * 100}%)`,
            width: '100%'
          }}
        >
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="hero-slide"
              style={{
                flex: '0 0 100%',
                width: '100%',
                cursor: 'pointer'
              }}
              onClick={onShopClick}
            >
              <img
                src={slide.url}
                alt={slide.alt}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  maxHeight: '480px',
                  objectFit: 'cover'
                }}
              />
            </div>
          ))}
        </div>

        {/* Carousel Prev/Next Controls */}
        <button
          className="carousel-btn prev-btn"
          onClick={handlePrev}
          aria-label="Previous Slide"
          style={{
            position: 'absolute',
            top: '50%',
            left: '16px',
            transform: 'translateY(-50%)',
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            backdropFilter: 'blur(4px)'
          }}
        >
          <ChevronLeft size={22} />
        </button>

        <button
          className="carousel-btn next-btn"
          onClick={handleNext}
          aria-label="Next Slide"
          style={{
            position: 'absolute',
            top: '50%',
            right: '16px',
            transform: 'translateY(-50%)',
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            backdropFilter: 'blur(4px)'
          }}
        >
          <ChevronRight size={22} />
        </button>

        {/* Dots Pagination Indicator */}
        <div
          className="carousel-dots"
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            zIndex: 10
          }}
        >
          {slides.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Core Health & Quality Pillars showcase below the Slideshow Banner */}
      <div className="container" style={{ marginTop: '30px' }}>
        <div className="pillars-list">
          <div className="pillar-card">
            <div className="pillar-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '26px' }}>
              <USFlagIcon />
            </div>
            <h3>USA Imported Raw Material</h3>
            <p>100% pure imported Whey & actives from top USA labs</p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '26px' }}>
              <USFlagIcon />
            </div>
            <h3>US Formulation</h3>
            <p>Scientifically engineered formulas built to elite US standards</p>
          </div>

          <div className="pillar-card">
            <Shield size={22} className="pillar-icon" />
            <h3>Boosts Immunity</h3>
            <p>Strengthen natural defense & vital cellular health</p>
          </div>

          <div className="pillar-card">
            <Activity size={22} className="pillar-icon" />
            <h3>Overall Wellness</h3>
            <p>Daily stamina, peak performance & muscle recovery</p>
          </div>
        </div>
      </div>
    </section>
  );
}
