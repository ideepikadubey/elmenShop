import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, Menu, X, User, ChevronDown, Droplet, Heart, LayoutGrid, Shirt, Leaf, LogOut } from 'lucide-react';
import { API_BASE_URL } from "../config/api";

const categories = [
  { key: 'all', label: 'All Categories', isGrid: true, bg: '#1a1a1a', color: '#ffbe00' },
  { key: 'proteins', label: 'Proteins', image: '/protein (2).png', bg: '#fff3e0', color: '#e65100' },
  { key: 'gainers', label: 'Gainers', image: '/gainer.png', bg: '#e8f5e9', color: '#2e7d32' },
  { key: 'preworkouts', label: 'Pre Workout', image: '/preworkout.png', bg: '#fce4ec', color: '#c62828' },
  { key: 'fitfoods', label: 'Wellness', image: '/fitfoods.png', bg: '#e3f2fd', color: '#1565c0' },
  { key: 'accessories', label: 'Accessories', image: '/shaker.png', bg: '#f3e5f5', color: '#6a1b9a' },
];

export default function Navbar({
  cartCount,
  onCartClick,
  wishlistCount = 0,
  onWishlistClick,
  onProfileClick,
  productsList = [],
  onSearchChange,
  searchTerm,
  activeTab,
  setActiveTab,
  user,
  onAuthClick,
  onLogoutClick
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const [isLaunchDropdownOpen, setIsLaunchDropdownOpen] = useState(false);

  // Search Autocomplete Suggestion states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  const dropdownRef = useRef(null);
  const authDropdownRef = useRef(null);
  const launchDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (authDropdownRef.current && !authDropdownRef.current.contains(e.target)) {
        setIsAuthDropdownOpen(false);
      }
      if (launchDropdownRef.current && !launchDropdownRef.current.contains(e.target)) {
        setIsLaunchDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNavClick = (tab, e) => {
    if (e) e.preventDefault();
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);

    if (tab === 'catalog' || tab === 'all-products') {
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'authenticity') {
      document.getElementById('authenticity')?.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'contact' || tab === 'chat' || tab === 'enquiry') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'offers') {
      window.dispatchEvent(new CustomEvent('elmen:openOffers'));
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (categoryKey) => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setActiveTab('catalog');
    window.dispatchEvent(new CustomEvent('elmen:category', { detail: categoryKey }));
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className={isScrolled ? 'scrolled double-row' : 'double-row'}>
      {/* Row 1: Logo & Utilities */}
      <div className="container navbar-container">
        <div className="logo" onClick={(e) => handleNavClick('home', e)}>
          <img src="/logo.png" alt="EL MEN Nutrition" />
        </div>

        <div className="search-bar centered-search" ref={searchContainerRef} style={{ position: 'relative' }}>
          <Search size={16} className="text-gray" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setShowSuggestions(true);
              if (activeTab !== 'catalog') {
                setActiveTab('catalog');
                document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />

          {showSuggestions && searchTerm.trim() && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#ffffff',
                border: '1px solid var(--bg-dark-600)',
                borderRadius: '8px',
                marginTop: '8px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                zIndex: 1000,
                maxHeight: '300px',
                overflowY: 'auto',
                padding: '8px'
              }}
            >
              {productsList
                .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .slice(0, 5)
                .map(p => (
                  <div
                    key={p._id || p.id}
                    onClick={() => {
                      setShowSuggestions(false);
                      setActiveTab('catalog');
                      window.dispatchEvent(new CustomEvent('elmen:category', { detail: p.category }));
                      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      borderBottom: '1px solid var(--bg-dark-700)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-dark-700)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: 'var(--bg-dark-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {p.image ? (
                        <img src={p.image.startsWith('http') ? p.image : `${API_BASE_URL}${p.image}`} alt={p.name} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                      ) : (
                        <div className="jar-graphic" style={{ height: '30px', width: '24px', padding: '1px', borderRadius: '2px', transform: 'scale(0.8)' }}>
                          <div className="jar-lid" style={{ height: '2px', width: '16px' }}></div>
                          <div className="jar-label" style={{ background: p.themeColor || 'var(--bg-dark-700)', marginTop: '1px' }} />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-white)', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.category}</div>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--primary-yellow-hover)', fontWeight: '900' }}>
                      ₹{((p.price && p.price > 0) ? p.price : (p.originalPrice || 0)).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))
              }
              {productsList.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
                  No suggestions matching your search.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Wishlist Icon Button */}
          <button
            className="cart-icon-btn"
            onClick={onWishlistClick}
            aria-label="Open Wishlist"
            style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Heart size={20} style={{ color: wishlistCount > 0 ? '#ff3b30' : 'currentColor' }} fill={wishlistCount > 0 ? '#ff3b30' : 'none'} />
            {wishlistCount > 0 && <span className="cart-badge" style={{ backgroundColor: '#ff3b30', color: '#fff' }}>{wishlistCount}</span>}
          </button>

          <button className="cart-icon-btn" onClick={onCartClick} aria-label="Open Cart">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                onClick={onProfileClick}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-dark-700)', padding: '6px 10px', borderRadius: '20px', border: '1px solid var(--bg-dark-600)', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-dark-600)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-dark-700)'}
              >
                <User size={14} style={{ color: 'var(--primary-yellow)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-white)' }}>
                  Hi, {user.name.split(' ')[0]}
                </span>
              </div>
              <button
                className="btn btn-secondary nav-logout-btn"
                onClick={onLogoutClick}
                title="Logout"
                aria-label="Logout"
              >
                <LogOut size={16} />
                <span className="desktop-logout-text">Logout</span>
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary nav-login-btn"
              onClick={onAuthClick}
              title="Sign In / Register"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <User size={18} style={{ strokeWidth: 2.5, color: '#121212', flexShrink: 0 }} />
              <span className="desktop-login-text">Login</span>
            </button>
          )}

          <button
            className="mobile-nav-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Row 2: Sub-Navbar */}
      <nav className="sub-navbar">
        <div className="container sub-navbar-container">
          <ul className={`sub-nav-links ${isMobileMenuOpen ? 'open' : ''}`}>

            {/* Mobile-only Search Bar */}
            <li className="mobile-search-item" style={{ width: '100%', marginBottom: '10px' }}>
              <div
                className="search-bar"
                style={{
                  display: 'flex',
                  width: '100%',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid var(--bg-dark-600)',
                  borderRadius: '30px',
                  padding: '8px 16px',
                  position: 'relative'
                }}
              >
                <Search size={16} style={{ color: 'var(--text-muted)', marginRight: '8px' }} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    setShowSuggestions(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-white)',
                    width: '100%',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </li>

            {/* ALL PRODUCTS with category mega-dropdown */}
            <li className="has-dropdown" ref={dropdownRef}>
              <a
                href="#catalog"
                className={`dropdown-trigger ${activeTab === 'catalog' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setIsDropdownOpen(v => { const next = !v; if (next) { setIsLaunchDropdownOpen(false); setIsAuthDropdownOpen(false); } return next; }); }}
                onMouseEnter={() => { setIsDropdownOpen(true); setIsLaunchDropdownOpen(false); setIsAuthDropdownOpen(false); }}
              >
                ALL PRODUCTS
                <ChevronDown
                  size={12}
                  style={{
                    marginLeft: '4px',
                    display: 'inline',
                    transition: 'transform 0.25s',
                    transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                />
              </a>

              {/* Mega Dropdown Panel */}
              <div
                className={`category-dropdown ${isDropdownOpen ? 'open' : ''}`}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <div className="category-dropdown-grid">
                  {categories.map((cat) => (
                    <button
                      key={cat.key}
                      className="cat-tile"
                      onClick={() => handleCategoryClick(cat.key)}
                    >
                      <div
                        className="cat-tile-icon"
                        style={{ background: cat.bg, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: cat.isGrid ? 0 : '4px' }}
                      >
                        {cat.isGrid ? (
                          <LayoutGrid size={20} color="#ffbe00" />
                        ) : (
                          <img src={cat.image} alt={cat.label} style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
                        )}
                      </div>
                      <span className="cat-tile-label">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </li>

            {/* LAUNCHING SOON with dropdown */}
            <li className="has-dropdown" ref={launchDropdownRef}>
              <a
                href="#"
                className={`dropdown-trigger ${activeTab === 'launching-soon' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setIsLaunchDropdownOpen(v => { const next = !v; if (next) { setIsDropdownOpen(false); setIsAuthDropdownOpen(false); } return next; }); }}
                onMouseEnter={() => { setIsLaunchDropdownOpen(true); setIsDropdownOpen(false); setIsAuthDropdownOpen(false); }}
              >
                LAUNCHING SOON
                <ChevronDown
                  size={12}
                  style={{
                    marginLeft: '4px',
                    display: 'inline',
                    transition: 'transform 0.25s',
                    transform: isLaunchDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                />
              </a>

              {/* Launching Soon Dropdown Panel */}
              <div
                className={`category-dropdown ${isLaunchDropdownOpen ? 'open' : ''}`}
                onMouseLeave={() => setIsLaunchDropdownOpen(false)}
                style={{ minWidth: '200px', padding: '6px', borderRadius: '12px' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>

                  {/* Perfumes Option */}
                  <button
                    onClick={() => {
                      setIsLaunchDropdownOpen(false);
                      setIsMobileMenuOpen(false);
                      window.dispatchEvent(new CustomEvent('elmen:openUpcoming', { detail: 'perfumes' }));
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      borderRadius: '8px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <div style={{ width: '28px', height: '28px', background: 'rgba(255,190,0,0.12)', color: 'var(--primary-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', flexShrink: 0 }}>
                      <Droplet size={14} fill="currentColor" />
                    </div>
                    <div>
                      <span style={{ fontWeight: '800', display: 'block', fontSize: '0.82rem', color: '#0f172a' }}>Perfumes</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Premium fragrances</span>
                    </div>
                  </button>

                  {/* Ayurveda Option */}
                  <button
                    onClick={() => {
                      setIsLaunchDropdownOpen(false);
                      setIsMobileMenuOpen(false);
                      window.dispatchEvent(new CustomEvent('elmen:openUpcoming', { detail: 'ayurveda' }));
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      borderRadius: '8px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <div style={{ width: '28px', height: '28px', background: 'rgba(34, 197, 94, 0.12)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', flexShrink: 0 }}>
                      <Leaf size={14} fill="currentColor" />
                    </div>
                    <div>
                      <span style={{ fontWeight: '800', display: 'block', fontSize: '0.82rem', color: '#0f172a' }}>Ayurveda</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Herbal & Shilajit</span>
                    </div>
                  </button>

                  {/* Clothing Option */}
                  <button
                    onClick={() => {
                      setIsLaunchDropdownOpen(false);
                      setIsMobileMenuOpen(false);
                      window.dispatchEvent(new CustomEvent('elmen:openUpcoming', { detail: 'clothing' }));
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      borderRadius: '8px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <div style={{ width: '28px', height: '28px', background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', flexShrink: 0 }}>
                      <Shirt size={14} fill="currentColor" />
                    </div>
                    <div>
                      <span style={{ fontWeight: '800', display: 'block', fontSize: '0.82rem', color: '#0f172a' }}>Clothing</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Premium activewear</span>
                    </div>
                  </button>


                </div>
              </div>
            </li>

            <li>
              <a href="#offers" className={activeTab === 'offers' ? 'active' : ''} onClick={(e) => handleNavClick('offers', e)}>
                OFFERS
              </a>
            </li>
            <li>
              <a
                href="#track-order"
                className={activeTab === 'track-order' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('elmen:openTrackOrder')); setIsMobileMenuOpen(false); }}
              >
                TRACK ORDER
              </a>
            </li>
            <li className="has-dropdown" ref={authDropdownRef}>
              <a
                href="#authenticity"
                className={`dropdown-trigger ${activeTab === 'authenticity' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setIsAuthDropdownOpen(v => { const next = !v; if (next) { setIsDropdownOpen(false); setIsLaunchDropdownOpen(false); } return next; }); }}
                onMouseEnter={() => { setIsAuthDropdownOpen(true); setIsDropdownOpen(false); setIsLaunchDropdownOpen(false); }}
              >
                AUTHENTICITY
                <ChevronDown
                  size={12}
                  style={{
                    marginLeft: '4px',
                    display: 'inline',
                    transition: 'transform 0.25s',
                    transform: isAuthDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                />
              </a>

              {/* Authenticity Dropdown Panel */}
              <div
                className={`category-dropdown ${isAuthDropdownOpen ? 'open' : ''}`}
                onMouseLeave={() => setIsAuthDropdownOpen(false)}
                style={{ minWidth: '185px', padding: '6px', borderRadius: '12px' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    className="cat-tile"
                    onClick={() => {
                      setIsAuthDropdownOpen(false);
                      setActiveTab('authenticity');
                      window.dispatchEvent(new CustomEvent('elmen:authenticity', { detail: 'check' }));
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', borderRadius: '8px' }}
                  >
                    <div style={{ width: '28px', height: '28px', background: 'rgba(255,190,0,0.12)', color: 'var(--primary-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '0.85rem', flexShrink: 0 }}>
                      🛡️
                    </div>
                    <div>
                      <span className="cat-tile-label" style={{ fontWeight: 800, display: 'block', fontSize: '0.78rem', color: '#0f172a', lineHeight: 1.2 }}>Product Verification</span>
                      <span style={{ fontSize: '0.62rem', color: '#64748b', display: 'block', marginTop: '2px' }}>Verify security code</span>
                    </div>
                  </button>

                  <button
                    className="cat-tile"
                    onClick={() => {
                      setIsAuthDropdownOpen(false);
                      setActiveTab('authenticity');
                      window.dispatchEvent(new CustomEvent('elmen:authenticity', { detail: 'reports' }));
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', borderRadius: '8px' }}
                  >
                    <div style={{ width: '28px', height: '28px', background: 'rgba(39, 174, 96, 0.12)', color: '#27ae60', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '0.85rem', flexShrink: 0 }}>
                      📋
                    </div>
                    <div>
                      <span className="cat-tile-label" style={{ fontWeight: 800, display: 'block', fontSize: '0.78rem', color: '#0f172a', lineHeight: 1.2 }}>Lab Reports</span>
                      <span style={{ fontSize: '0.62rem', color: '#64748b', display: 'block', marginTop: '2px' }}>Preview batch reports</span>
                    </div>
                  </button>
                </div>
              </div>
            </li>

            <li>
              <a
                href="https://wa.me/919119119187?text=Hi%20EL%20MEN%20Nutrition%2C%20I%20need%20support%20with%20my%20order."
                target="_blank"
                rel="noopener noreferrer"
              >
                CHAT SUPPORT
              </a>
            </li>
            <li>
              <a
                href="#business-enquiry"
                onClick={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('elmen:openBusinessEnquiry'));
                }}
              >
                BUSINESS ENQUIRY
              </a>
            </li>
            {user && user.role === 'admin' && (
              <li>
                <a
                  href="#admin"
                  className={activeTab === 'admin' ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); setActiveTab('admin'); }}
                  style={{ color: 'var(--primary-yellow)', fontWeight: '900', border: '1px dashed var(--primary-yellow)', padding: '6px 12px', borderRadius: '4px' }}
                >
                  🛠️ ADMIN PANEL
                </a>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div
          className="mobile-drawer-menu"
          style={{
            position: 'fixed',
            top: '65px',
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: 'calc(100vh - 65px)',
            backgroundColor: '#ffffff',
            zIndex: 999999,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            boxSizing: 'border-box'
          }}
        >
          {/* Mobile Search Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              backgroundColor: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              borderRadius: '30px',
              padding: '10px 16px',
              boxSizing: 'border-box'
            }}
          >
            <Search size={18} style={{ color: '#64748b', marginRight: '8px', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setShowSuggestions(true);
                if (activeTab !== 'catalog') {
                  setActiveTab('catalog');
                  document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#0f172a',
                width: '100%',
                fontSize: '0.95rem',
                fontWeight: '600'
              }}
            />
          </div>

          {/* Nav Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <button
              onClick={() => { handleCategoryClick('all'); setIsMobileMenuOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: '#fff', border: 'none', borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', cursor: 'pointer', width: '100%' }}
            >
              <span>🛍️ ALL PRODUCTS</span>
            </button>

            {/* Category Quick Grid */}
            <div style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Categories</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {categories.filter(c => !c.isGrid).map(cat => (
                  <button
                    key={`mob-${cat.key}`}
                    onClick={() => { handleCategoryClick(cat.key); setIsMobileMenuOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <img src={cat.image} alt={cat.label} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={(e) => { handleNavClick('offers', e); setIsMobileMenuOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: '#fff', border: 'none', borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', cursor: 'pointer', width: '100%' }}
            >
              <span>🔥 OFFERS & COUPONS</span>
            </button>

            <button
              onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('elmen:openTrackOrder')); setIsMobileMenuOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: '#fff', border: 'none', borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', cursor: 'pointer', width: '100%' }}
            >
              <span>🚚 TRACK ORDER</span>
            </button>

            <button
              onClick={(e) => { handleNavClick('authenticity', e); setIsMobileMenuOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: '#fff', border: 'none', borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', cursor: 'pointer', width: '100%' }}
            >
              <span>🛡️ PRODUCT VERIFICATION</span>
            </button>

            <button
              onClick={(e) => { handleNavClick('contact', e); setIsMobileMenuOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: '#fff', border: 'none', borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', cursor: 'pointer', width: '100%' }}
            >
              <span>📞 CONTACT & SUPPORT</span>
            </button>

            {user && user.role === 'admin' && (
              <button
                onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', marginTop: '10px', fontSize: '0.95rem', fontWeight: '800', color: '#b45309', cursor: 'pointer', width: '100%' }}
              >
                <span>🛠️ ADMIN PANEL</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
