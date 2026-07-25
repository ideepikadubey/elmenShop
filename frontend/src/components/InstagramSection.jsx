import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, MessageCircle, ExternalLink } from 'lucide-react';

import { API_BASE_URL } from '../config/api';

// Mock Instagram posts — fallback when API or DB has no items
const defaultPosts = [
  {
    _id: "mock1",
    src: '/a.png',
    caption: '💪 Fuel Your Legacy! Clean Whey delivering real results every session. #ELMEN #FuelYourLegacy',
    likes: 1284,
    comments: 47,
    handle: '@elmen_india',
    permalink: 'https://instagram.com/elmen_india'
  },
  {
    _id: "mock2",
    src: '/b.png',
    caption: '🔥 Unstoppable energy with Hunter Pre-Workout. Don\'t train without it. #PreWorkout #HunterMode',
    likes: 986,
    comments: 38,
    handle: '@elmen_india',
    permalink: 'https://instagram.com/elmen_india'
  },
  {
    _id: "mock3",
    src: '/c.png',
    caption: '🏆 Premium quality, real ingredients. Because you deserve the best. #NutritionGoals #ELMEN',
    likes: 2103,
    comments: 64,
    handle: '@elmen_india',
    permalink: 'https://instagram.com/elmen_india'
  },
  {
    _id: "mock4",
    src: '/d.png',
    caption: '⚡ Power, performance, and recovery — all in one stack. Shop the range now! #Gainz',
    likes: 1542,
    comments: 53,
    handle: '@elmen_india',
    permalink: 'https://instagram.com/elmen_india'
  },
  {
    _id: "mock5",
    src: '/aa.png',
    caption: '🌟 Your transformation starts here. Every rep counts. Every meal matters. #StrengthJourney',
    likes: 3218,
    comments: 92,
    handle: '@elmen_india',
    permalink: 'https://instagram.com/elmen_india'
  }
];

function formatCount(n) {
  if (!n) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

export default function InstagramSection() {
  const [posts, setPosts] = useState(defaultPosts);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/instagram`)
      .then(res => {
        if (res.data.success && res.data.posts && res.data.posts.length > 0) {
          setPosts(res.data.posts);
        }
      })
      .catch(err => {
        console.warn('Instagram feed fetch fallback:', err);
      });
  }, []);
  return (
    <section className="instagram-section">
      <div className="container">
        {/* Header */}
        <div className="instagram-header">
          <div className="insta-logo-badge">
            <img src="/instagram.png" alt="Instagram" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          </div>
          <div>
            <h2>Follow Us on <span>Instagram</span></h2>
            <a
              href="https://instagram.com/elmen_india"
              target="_blank"
              rel="noopener noreferrer"
              className="insta-handle-link"
            >
              @elmen_india <ExternalLink size={13} style={{ marginLeft: 4 }} />
            </a>
          </div>
        </div>

        {/* Post Grid */}
        <div className="instagram-grid">
          {posts.map((post) => (
            <a
              key={post._id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="insta-post-card"
            >
              <div className="insta-image-wrapper">
                <img 
                  src={post.src} 
                  alt={post.caption} 
                  className="insta-image" 
                />
                {/* Hover overlay */}
                <div className="insta-overlay">
                  <div className="insta-stats">
                    <span><Heart size={16} fill="white" /> {formatCount(post.likes)}</span>
                    <span><MessageCircle size={16} fill="white" /> {formatCount(post.comments)}</span>
                  </div>
                </div>
                <div className="insta-corner-logo">
                  <img src="/instagram.png" alt="Instagram" style={{ width: 14, height: 14, objectFit: 'contain' }} />
                </div>
              </div>
              <p className="insta-caption">{post.caption}</p>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="instagram-cta">
          <a
            href="https://instagram.com/elmen_india"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-instagram"
          >
            <img src="/instagram.png" alt="Instagram" style={{ width: 22, height: 22, objectFit: 'contain' }} />
            Follow @elmen_india
          </a>
        </div>
      </div>
    </section>
  );
}
