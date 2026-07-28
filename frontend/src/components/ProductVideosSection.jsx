import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Instagram, ExternalLink, Sparkles } from 'lucide-react';
const videoList = [
  {
    id: 'vid-1',
    title: 'Clean Whey Protein',
    subtitle: '100% Pure Whey Isolate & Concentrate Blend',
    src: '/videos/product1.mp4',
    fallbackSrc: '/banner.mp4',
    poster: '/a.png',
    badge: 'Best Seller'
  },
  {
    id: 'vid-2',
    title: 'Hunter Pre-Workout',
    subtitle: 'Explosive Power, Extreme Focus & Intense Pump',
    src: '/videos/product2.mp4',
    fallbackSrc: '/banner.mp4',
    poster: '/b.png',
    badge: 'High Energy'
  },
  {
    id: 'vid-3',
    title: 'EL MEN Mass Gainer',
    subtitle: 'Maximum Muscle Building & High-Calorie Formula',
    src: '/videos/product3.mp4',
    fallbackSrc: '/banner.mp4',
    poster: '/c.png',
    badge: 'Mass Gain'
  },
  {
    id: 'vid-4',
    title: 'Daily Vitality & Recovery',
    subtitle: 'Essential Vitamins, Minerals & Joint Support',
    src: '/videos/product4.mp4',
    fallbackSrc: '/banner.mp4',
    poster: '/d.png',
    badge: 'Wellness'
  }
];

function VideoCard({ video }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Auto-play blocked or error:', err);
      });
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleError = () => {
    if (!hasError && video.fallbackSrc) {
      setHasError(true);
    }
  };

  return (
    <div className="product-video-card" onClick={togglePlay}>
      <div className="product-video-wrapper">
        <video
          ref={videoRef}
          src={hasError ? video.fallbackSrc : video.src}
          poster={video.poster}
          loop
          muted={isMuted}
          playsInline
          onError={handleError}
          className="product-video-element"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Top Badges */}
        <div className="video-card-top-bar">
          <span className="video-badge">
            <Sparkles size={12} style={{ marginRight: 4 }} />
            {video.badge}
          </span>
          <button
            className="video-mute-btn"
            onClick={toggleMute}
            title={isMuted ? "Unmute" : "Mute"}
            type="button"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {/* Play/Pause Button Overlay */}
        <div className={`video-play-overlay ${isPlaying ? 'is-playing' : ''}`}>
          <div className="video-play-btn">
            {isPlaying ? <Pause size={24} fill="#fff" /> : <Play size={24} fill="#fff" style={{ marginLeft: 3 }} />}
          </div>
        </div>

        {/* Bottom Details Overlay */}
        <div className="video-info-overlay">
          <h3 className="video-title">{video.title}</h3>
          <p className="video-subtitle">{video.subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export default function ProductVideosSection() {
  return (
    <section className="product-videos-section">
      <div className="container">
        {/* Header */}
        <div className="product-videos-header">
          <div className="videos-header-title">
            <div className="insta-logo-badge">
              <img src="/instagram.png" alt="Instagram" style={{ width: 28, height: 28, objectFit: 'contain' }} />
            </div>
            <div>
              <h2>Watch Our <span>Product Videos</span></h2>
              <p className="videos-section-subtitle">Experience EL MEN Premium Nutrition in Action</p>
            </div>
          </div>

          {/* Instagram Button in Header */}
          <a
            href="https://instagram.com/elmen_india"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-instagram header-insta-btn"
          >
            <img src="/instagram.png" alt="Instagram" style={{ width: 20, height: 20, objectFit: 'contain' }} />
            Follow @elmen_india
            <ExternalLink size={14} style={{ marginLeft: 2 }} />
          </a>
        </div>

        {/* Videos Grid */}
        <div className="product-videos-grid">
          {videoList.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>

        {/* Footer Instagram CTA */}
        <div className="instagram-cta" style={{ marginTop: 32 }}>
          <a
            href="https://instagram.com/elmen_india"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-instagram"
          >
            <img src="/instagram.png" alt="Instagram" style={{ width: 22, height: 22, objectFit: 'contain' }} />
            Follow @elmen_india on Instagram
            <ExternalLink size={16} style={{ marginLeft: 4 }} />
          </a>
        </div>
      </div>
    </section>
  );
}
