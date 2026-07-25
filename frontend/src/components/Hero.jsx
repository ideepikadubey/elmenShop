import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Activity, Heart, ChevronLeft, ChevronRight } from 'lucide-react';

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
    <section className="hero-section" id="home">
      {/* Edge-to-Edge Full Size Cover Slideshow Banner */}
      <div className="hero-slideshow-full">
        {slides.map((slide, idx) => (
          <div 
            className={`slideshow-slide ${idx === currentSlide ? 'active' : ''}`} 
            key={idx}
          >
            <img 
              src={slide.url} 
              alt={slide.alt} 
              className="slideshow-image" 
              loading={idx === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}

        <button 
          className="slideshow-arrow left" 
          onClick={handlePrev} 
          aria-label="Previous Slide"
        >
          <ChevronLeft size={24} />
        </button>
        
        <button 
          className="slideshow-arrow right" 
          onClick={handleNext} 
          aria-label="Next Slide"
        >
          <ChevronRight size={24} />
        </button>

        <div className="slideshow-dots">
          {slides.map((_, idx) => (
            <button
              key={idx}
              className={`slideshow-dot ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Core Health Pillars showcase below the Slideshow Banner */}
      <div className="container" style={{ marginTop: '30px' }}>
        <div className="pillars-list">
          <div className="pillar-card">
            <Shield size={22} className="pillar-icon" />
            <h3>Boosts Immunity</h3>
            <p>Strengthen natural defense</p>
          </div>
          <div className="pillar-card">
            <Sparkles size={22} className="pillar-icon" />
            <h3>Strong Bones</h3>
            <p>Calcium & mineral support</p>
          </div>
          <div className="pillar-card">
            <Activity size={22} className="pillar-icon" />
            <h3>Overall Wellness</h3>
            <p>Daily stamina & health</p>
          </div>
          <div className="pillar-card">
            <Heart size={22} className="pillar-icon" />
            <h3>Nutritional Support</h3>
            <p>Complete vitamin intake</p>
          </div>
        </div>
      </div>
    </section>
  );
}
