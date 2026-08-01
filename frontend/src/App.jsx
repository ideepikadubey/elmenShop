import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getImageUrl } from "./config/api";
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AuthenticityChecker from './components/AuthenticityChecker';
import AuthenticityPage from './components/AuthenticityPage';
import LabReportsPage from './components/LabReportsPage';
import ContactSection from './components/ContactSection';
import ReviewsSection from './components/ReviewsSection';
import ProductVideosSection from './components/ProductVideosSection';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Offers from './components/Offers';
import DisclaimerModal from './components/DisclaimerModal';
import TermsPolicyModal from './components/TermsPolicyModal';
import TrackOrder from './components/TrackOrder';
import LeadPopupModal from './components/LeadPopupModal';
import BusinessEnquiryModal from './components/BusinessEnquiryModal';
import UpcomingProductsModal from './components/UpcomingProductsModal';
import FlavourSelectModal from './components/FlavourSelectModal';
const staticProducts = [];
import { Award, Compass, RefreshCw, Layers, Shield, LayoutGrid, Zap, Truck, FlaskConical, Gem, CheckCircle } from 'lucide-react';
import AdminDashboard from './components/AdminDashboard';
import FAQSection from './components/FAQSection';
import { Heart, Trash2, X, User, Mail, Phone, ShoppingBag, Calendar, Package, IndianRupee, LogOut, CheckCircle2, Clock, XCircle, Flame, Truck as TruckIcon } from 'lucide-react';

export default function App() {
  const [productsList, setProductsList] = useState(staticProducts);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('elmen_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [activeTab, setActiveTab] = useState('home');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPriceDetails, setCheckoutPriceDetails] = useState(null);
  const [pendingCheckoutDetails, setPendingCheckoutDetails] = useState(null);
  const [flavourSelectProduct, setFlavourSelectProduct] = useState(null);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('elmen_cart', JSON.stringify(cart));
  }, [cart]);

  // Auto-heal cached cart items in localStorage if any item has 0 price
  useEffect(() => {
    if (cart && cart.length > 0 && productsList && productsList.length > 0) {
      let updated = false;
      const newCart = cart.map(item => {
        const pPrice = Number(item.price || 0);
        if (pPrice === 0) {
          const matchingProd = productsList.find(p => String(p._id || p.id) === String(item._id || item.id || item.productId));
          if (matchingProd) {
            const correctPrice = Number(matchingProd.price || matchingProd.originalPrice || 0);
            if (correctPrice > 0) {
              updated = true;
              return { ...item, price: correctPrice, originalPrice: Number(matchingProd.originalPrice || 0) };
            }
          }
        }
        return item;
      });
      if (updated) {
        setCart(newCart);
      }
    }
  }, [productsList]);

  // Authenticated user session state
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('elmen_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authPrompt, setAuthPrompt] = useState(''); // message shown in auth modal

  // Keep authenticated user session active & synchronized across page reloads/refreshes
  useEffect(() => {
    const token = localStorage.getItem('elmen_token');
    if (token) {
      axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('elmen_user', JSON.stringify(res.data.user));
          }
        })
        .catch(err => {
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            setUser(null);
            localStorage.removeItem('elmen_user');
            localStorage.removeItem('elmen_token');
          }
        });
    }
  }, []);

  // Wishlist and Order Profile states
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('elmen_wishlist');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // Discard old numeric IDs from static mock products (before DB was seeded)
      const valid = parsed.filter(id => String(id).length > 10);
      if (valid.length !== parsed.length) {
        localStorage.setItem('elmen_wishlist', JSON.stringify(valid));
      }
      return valid;
    } catch { return []; }
  });
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [legalActiveTab, setLegalActiveTab] = useState('terms');
  const [isReturnPolicyOpen, setIsReturnPolicyOpen] = useState(false);
  const [isBusinessEnquiryOpen, setIsBusinessEnquiryOpen] = useState(false);
  const [isUpcomingOpen, setIsUpcomingOpen] = useState(false);
  const [upcomingCategory, setUpcomingCategory] = useState('all');
  const [trackingAwb, setTrackingAwb] = useState('');
  const [tickerOffers, setTickerOffers] = useState([]);

  const handleToggleWishlist = (productId) => {
    const pid = String(productId);
    let list = [...wishlist];
    if (list.map(String).includes(pid)) {
      list = list.filter(id => String(id) !== pid);
    } else {
      list.push(pid);
    }
    setWishlist(list);
    localStorage.setItem('elmen_wishlist', JSON.stringify(list));
  };

  const fetchUserOrders = async () => {
    try {
      const token = localStorage.getItem('elmen_token');
      if (!token) return;
      const res = await axios.get(`${API_BASE_URL}/api/orders/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setUserOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch user orders:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    } else {
      setUserOrders([]);
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products?limit=100`);
      const data = response.data;
      if (data.success && data.products && data.products.length > 0) {
        setProductsList(data.products);
      }
    } catch (err) {
      console.warn('Backend products fetch failed, using local static data fallback:', err);
    } finally {
      setIsLoadingProducts(false);
      fetchTickerOffers();
    }
  };

  const fetchTickerOffers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/offers`);
      if (res.data.success && Array.isArray(res.data.offers)) {
        const now = Date.now();
        const validOffers = res.data.offers.filter(o => {
          const isNotExpired = new Date(o.endDate).getTime() > now;
          return o.isActive !== false && isNotExpired;
        });
        setTickerOffers(validOffers);
      }
    } catch (err) {
      console.warn('Failed to fetch ticker offers:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchTickerOffers();
  }, []);

  const getProductId = (product) => String(product._id || product.id || '');

  // Listen for category selection events dispatched by the Navbar dropdown
  useEffect(() => {
    const handler = (e) => {
      const cat = e.detail;
      // map dropdown keys to product category values
      const catMap = {
        all: 'all', proteins: 'proteins', gainers: 'gainers',
        preworkouts: 'preworkouts', wellness: 'wellness',
        fitfoods: 'wellness', accessories: 'accessories', performance: 'performance'
      };
      setActiveCategory(catMap[cat] || 'all');
    };
    window.addEventListener('elmen:category', handler);
    return () => window.removeEventListener('elmen:category', handler);
  }, []);

  // Open auth modal when triggered from child components (e.g. reviews "Sign in" link)
  useEffect(() => {
    const handler = () => setIsAuthOpen(true);
    window.addEventListener('elmen:openAuth', handler);
    return () => window.removeEventListener('elmen:openAuth', handler);
  }, []);

  // Open offers page when triggered from child components (e.g. Navbar "Offers" link)
  useEffect(() => {
    const handler = () => {
      setActiveTab('offers');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('elmen:openOffers', handler);
    return () => window.removeEventListener('elmen:openOffers', handler);
  }, []);

  // Open upcoming products modal when triggered from Navbar or Footer
  useEffect(() => {
    const handler = (e) => {
      if (e.detail) setUpcomingCategory(e.detail);
      else setUpcomingCategory('all');
      setIsUpcomingOpen(true);
    };
    window.addEventListener('elmen:openUpcoming', handler);
    return () => window.removeEventListener('elmen:openUpcoming', handler);
  }, []);

  // Handle authenticity and lab reports navigation events
  useEffect(() => {
    const handler = (e) => {
      if (e.detail === 'reports') {
        setActiveTab('lab-reports');
      } else {
        setActiveTab('authenticity');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('elmen:authenticity', handler);
    return () => window.removeEventListener('elmen:authenticity', handler);
  }, []);

  // Intersection Observer scroll reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    const elements = document.querySelectorAll(
      '.reveal-fade, .reveal-slide-up, .reveal-slide-left, .reveal-slide-right'
    );
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [productsList, activeTab, activeCategory]);

  // Open disclaimer modal when triggered from child components (e.g. Footer link)
  useEffect(() => {
    const handler = () => setIsDisclaimerOpen(true);
    window.addEventListener('elmen:openDisclaimer', handler);
    return () => window.removeEventListener('elmen:openDisclaimer', handler);
  }, []);

  // Open terms modal when triggered from footer
  useEffect(() => {
    const handler = () => {
      setLegalActiveTab('terms');
      setIsTermsOpen(true);
    };
    window.addEventListener('elmen:openTerms', handler);
    return () => window.removeEventListener('elmen:openTerms', handler);
  }, []);

  // Open privacy modal when triggered from footer
  useEffect(() => {
    const handler = () => {
      setLegalActiveTab('privacy');
      setIsTermsOpen(true);
    };
    window.addEventListener('elmen:openPrivacy', handler);
    return () => window.removeEventListener('elmen:openPrivacy', handler);
  }, []);

  // Open return policy modal when triggered from footer
  useEffect(() => {
    const handler = () => setIsReturnPolicyOpen(true);
    window.addEventListener('elmen:openReturnPolicy', handler);
    return () => window.removeEventListener('elmen:openReturnPolicy', handler);
  }, []);

  // Open business enquiry modal when triggered from navbar, footer or contact section
  useEffect(() => {
    const handler = () => setIsBusinessEnquiryOpen(true);
    window.addEventListener('elmen:openBusinessEnquiry', handler);
    return () => window.removeEventListener('elmen:openBusinessEnquiry', handler);
  }, []);

  // Navigate to track order tab when triggered from footer, navbar or order profile
  useEffect(() => {
    const handler = (e) => {
      if (e.detail) {
        setTrackingAwb(e.detail);
      }
      setActiveTab('track-order');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('elmen:openTrackOrder', handler);
    return () => window.removeEventListener('elmen:openTrackOrder', handler);
  }, []);

  // Cart operations
  const handleAddToCart = (product, flavourOverride) => {
    const selectedFlavour = flavourOverride || product.selectedFlavour;
    const defaultCategoryFlavours = {
      gainers: ['Malai Kulfi', 'Chocolate'],
      proteins: ['Kesar Badam', 'Cookies & Cream', 'Chocolate', 'Malai Kulfi']
    };
    const flavoursList = Array.isArray(product.flavours) && product.flavours.length > 0
      ? product.flavours
      : (defaultCategoryFlavours[product.category] || []);

    // If product has flavours but no flavour was selected yet (e.g. direct click from homepage card):
    if (flavoursList.length > 0 && !selectedFlavour) {
      setFlavourSelectProduct(product);
      return;
    }

    const itemFlavour = selectedFlavour || (flavoursList.length > 0 ? flavoursList[0] : '');
    const pPrice = Number(product.price || 0);
    const pOrig = Number(product.originalPrice || 0);
    const effectivePrice = pPrice > 0 ? pPrice : (pOrig > 0 ? pOrig : 0);
    const productToAdd = { ...product, price: effectivePrice, originalPrice: pOrig, selectedFlavour: itemFlavour, flavour: itemFlavour };

    setCart((prevCart) => {
      const pid = getProductId(product);
      const existingIndex = prevCart.findIndex(
        (item) => getProductId(item) === pid && (item.selectedFlavour || item.flavour || '') === itemFlavour
      );
      if (existingIndex > -1) {
        return prevCart.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...productToAdd, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQty = (productId, newQty, flavour) => {
    if (newQty <= 0) {
      handleRemoveItem(productId, flavour);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        (getProductId(item) === productId && (item.selectedFlavour || item.flavour || '') === (flavour || ''))
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const handleRemoveItem = (productId, flavour) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(getProductId(item) === productId && (item.selectedFlavour || item.flavour || '') === (flavour || ''))
      )
    );
  };

  const handleOpenCheckout = (priceDetails) => {
    setCheckoutPriceDetails(priceDetails);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem('elmen_cart');
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById(tab)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('elmen_user', JSON.stringify(userData));
    setIsAuthOpen(false);
    setAuthPrompt('');

    if (pendingCheckoutDetails) {
      setIsCartOpen(false);
      setCheckoutPriceDetails(pendingCheckoutDetails);
      setIsCheckoutOpen(true);
      setPendingCheckoutDetails(null);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setWishlist([]);
    localStorage.removeItem('elmen_user');
    localStorage.removeItem('elmen_token');
    localStorage.removeItem('elmen_wishlist');
    if (activeTab === 'admin') {
      setActiveTab('home');
    }
  };

  const [sortBy, setSortBy] = useState('default'); // 'default' (admin custom order), 'newest', 'price-low', 'price-high', 'name', 'discount'

  // Filters and Sorting logic
  const filteredProducts = [...productsList]
    .filter((product) => {
      const query = searchTerm.toLowerCase().trim();
      const matchesCategory = !query || activeCategory === 'all' || product.category === activeCategory;
      
      const defaultCategoryFlavours = {
        gainers: ['Malai Kulfi', 'Chocolate', 'Kesar Badam', 'Vanilla'],
        proteins: ['Kesar Badam', 'Cookies & Cream', 'Chocolate', 'Malai Kulfi', 'Vanilla'],
        preworkouts: ['Watermelon', 'Fruit Punch', 'Blue Raspberry'],
        wellness: ['Unflavoured'],
        accessories: ['Black', 'Navy Blue', 'Grey']
      };

      const availableFlavours = Array.isArray(product.flavours) && product.flavours.length > 0
        ? product.flavours
        : (defaultCategoryFlavours[product.category] || []);

      if (!query) return matchesCategory;

      const tokens = query.split(/\s+/).filter(Boolean);

      const searchableText = [
        product.name || '',
        product.subtitle || '',
        product.category || '',
        product.details || '',
        product.weight || '',
        product.badge || '',
        ...availableFlavours
      ].join(' ').toLowerCase();

      const matchesSearch = tokens.every(token => searchableText.includes(token));

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortBy === 'price-high') {
        return (b.price || 0) - (a.price || 0);
      }
      if (sortBy === 'newest') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'discount') {
        const discA = (a.originalPrice && a.originalPrice > a.price) ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const discB = (b.originalPrice && b.originalPrice > b.price) ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return discB - discA;
      }
      // 'default' (custom order set by Admin):
      const orderA = a.displayOrder !== undefined ? a.displayOrder : 9999;
      const orderB = b.displayOrder !== undefined ? b.displayOrder : 9999;
      if (orderA !== orderB) return orderA - orderB;
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {activeTab !== 'admin' && (
        <Navbar
          cartCount={cartCount}
          onCartClick={() => setIsCartOpen(true)}
          wishlistCount={wishlist.length}
          onWishlistClick={() => setIsWishlistOpen(true)}
          onProfileClick={() => { fetchUserOrders(); setIsProfileOpen(true); }}
          productsList={productsList}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          onAuthClick={() => setIsAuthOpen(true)}
          onLogoutClick={handleLogout}
        />
      )}

      {activeTab === 'admin' ? (
        <AdminDashboard
          onRefreshStoreProducts={fetchProducts}
          onLogout={handleLogout}
          onGoToStore={() => setActiveTab('home')}
        />
      ) : activeTab === 'track-order' ? (
        <TrackOrder
          initialAwb={trackingAwb}
          onGoBack={() => setActiveTab('home')}
        />
      ) : activeTab === 'offers' ? (
        <Offers
          onGoBack={() => setActiveTab('home')}
          onShopClick={() => handleNavClick('catalog')}
        />
      ) : activeTab === 'authenticity' ? (
        <AuthenticityPage
          onGoBack={() => setActiveTab('home')}
        />
      ) : activeTab === 'lab-reports' ? (
        <LabReportsPage
          onGoBack={() => setActiveTab('home')}
        />
      ) : (
        <>
          <Hero onShopClick={() => handleNavClick('catalog')} />

          {/* Ticker Tape Marquee Section */}
          <style>{`
            .ticker-tape {
              background: #000000;
              border-top: 1px solid #1c1c1c;
              border-bottom: 1px solid #1c1c1c;
              padding: 16px 0;
              overflow: hidden;
              white-space: nowrap;
              width: 100%;
              display: flex;
              align-items: center;
            }
            .ticker-tape-track {
              display: inline-flex;
              align-items: center;
              animation: ticker-scroll 30s linear infinite;
            }
            @keyframes ticker-scroll {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-50%, 0, 0); }
            }
            .ticker-item {
              font-size: 0.85rem;
              font-weight: 900;
              letter-spacing: 2px;
              text-transform: uppercase;
              color: #ffffff;
            }
            .ticker-item.offer-item {
              color: var(--primary-yellow);
              text-shadow: 0 0 12px rgba(255, 190, 0, 0.45);
            }
            .ticker-dot {
              color: var(--primary-yellow);
              margin: 0 30px;
              font-size: 1.2rem;
            }
          `}</style>
          {(() => {
            const defaultTickerItems = [
              { text: 'Backed by Science', isOffer: false },
              { text: '100% Transparency', isOffer: false },
              { text: 'No Secrets', isOffer: false },
              { text: 'Third-Party Lab Tested', isOffer: false },
              { text: 'GMP Certified Quality', isOffer: false },
              { text: 'Zero Fillers', isOffer: false }
            ];

            const offerTickerItems = tickerOffers.map(o => ({
              text: o.discountType === 'percentage'
                ? `🔥 USE CODE ${o.code} FOR ${o.discountValue}% OFF (${o.title})`
                : `🔥 USE CODE ${o.code} FOR ₹${o.discountValue} OFF (${o.title})`,
              isOffer: true
            }));

            const allTickerItems = offerTickerItems.length > 0
              ? [...offerTickerItems, ...defaultTickerItems, ...offerTickerItems]
              : defaultTickerItems;

            return (
              <div className="ticker-tape">
                <div className="ticker-tape-track">
                  {allTickerItems.map((item, idx) => (
                    <React.Fragment key={`ticker-1-${idx}`}>
                      <span className={`ticker-item ${item.isOffer ? 'offer-item' : ''}`}>
                        {item.text}
                      </span>
                      <span className="ticker-dot">•</span>
                    </React.Fragment>
                  ))}
                  {/* Duplicate items for seamless infinite loop */}
                  {allTickerItems.map((item, idx) => (
                    <React.Fragment key={`ticker-2-${idx}`}>
                      <span className={`ticker-item ${item.isOffer ? 'offer-item' : ''}`}>
                        {item.text}
                      </span>
                      <span className="ticker-dot">•</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Catalog Listing */}
          <section className="catalog-section reveal-slide-up" id="catalog">
            <div className="container">
              <div className="section-header">
                <h2 style={{ textTransform: 'uppercase', fontWeight: 900, fontSize: '2.6rem' }}>WHAT IS YOUR <span>MOVE?</span></h2>
                <p>
                  Premium supplements designed to support performance, recovery, immunity, strength, and everyday wellness. Maximum results.
                </p>
              </div>

              <div className="catalog-categories-row" style={{ display: 'flex', justifyContent: 'center', gap: '28px', flexWrap: 'wrap', marginBottom: '45px', marginTop: '25px' }}>
                {[
                  { key: 'all', label: 'Categories', isGrid: true },
                  { key: 'proteins', label: 'Proteins', image: '/protein (2).png' },
                  { key: 'gainers', label: 'Gainers', image: '/gainer.png' },
                  { key: 'preworkouts', label: 'Pre-Workout', image: '/preworkout.png' },
                  { key: 'wellness', label: 'Wellness', image: '/wellness.png' },
                  { key: 'accessories', label: 'Accessories', image: '/shaker.png' },
                  { key: 'performance', label: 'Performance', image: '/fitfoods.png' },
                ].map((cat) => {
                  const isActive = activeCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      className={`category-btn ${isActive ? 'active' : ''}`}
                    >
                      <div className={`category-btn-box ${isActive ? 'active' : ''}`} style={{ overflow: 'hidden', padding: cat.isGrid ? 0 : '4px' }}>
                        {cat.isGrid ? (
                          <LayoutGrid size={32} color="#1a1a1a" />
                        ) : (
                          <img
                            src={cat.image}
                            alt={cat.label}
                            style={{
                              width: '72px',
                              height: '72px',
                              objectFit: 'contain'
                            }}
                          />
                        )}
                      </div>
                      <span className="category-btn-label">
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-gray)', padding: '40px 0' }}>
                  <p style={{ fontSize: '1.2rem' }}>No products found matching your filters.</p>
                </div>
              ) : (
                <div className="products-grid">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={getProductId(product)}
                      product={product}
                      isWishlisted={wishlist.map(String).includes(getProductId(product))}
                      onToggleWishlist={handleToggleWishlist}
                      onAddToCart={handleAddToCart}
                      onQuickView={setSelectedProduct}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Best Sellers Section */}
          <section className="best-sellers-section reveal-slide-up" style={{ padding: '60px 0 30px', background: 'var(--bg-dark-950)' }}>
            <div className="container">
              <div className="best-sellers-header-card">
                {/* Ambient Radial Glow */}
                <div className="ambient-glow" />

                <div className="best-sellers-badge">
                  <Flame size={14} />
                  TOP SELLING SQUAD
                </div>

                <h2 className="best-sellers-title">
                  OUR <span className="best-sellers-title-accent">BEST SELLERS</span>
                </h2>

                <p className="best-sellers-subtitle">
                  The most popular formulas trusted by our elite fitness community.
                </p>
              </div>

              <div className="products-grid">
                {(productsList.filter(p => {
                  const badgeText = p.badge ? String(p.badge).toLowerCase() : '';
                  return badgeText.includes('best') || p.rating >= 4.8 || p.name.includes('Whey') || p.name.includes('Hunter');
                }).slice(0, 3).length > 0
                  ? productsList.filter(p => {
                    const badgeText = p.badge ? String(p.badge).toLowerCase() : '';
                    return badgeText.includes('best') || p.rating >= 4.8 || p.name.includes('Whey') || p.name.includes('Hunter');
                  }).slice(0, 3)
                  : productsList.slice(0, 3)
                ).map((product) => (
                  <ProductCard
                    key={`best-${getProductId(product)}`}
                    product={product}
                    isWishlisted={wishlist.map(String).includes(getProductId(product))}
                    onToggleWishlist={handleToggleWishlist}
                    onAddToCart={handleAddToCart}
                    onQuickView={setSelectedProduct}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* ── Why Choose Us: Video Background Feature Showcase ── */}
          <section className="why-choose-us-section reveal-slide-up" style={{ position: 'relative', padding: '90px 0', overflow: 'hidden', borderBottom: '1px solid var(--bg-dark-600)' }}>

            {/* Auto-playing Background Video */}
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 0
              }}
            >
              <source src="/banner.mp4" type="video/mp4" />
            </video>

            {/* Low Opacity Dark Overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(2px)',
              zIndex: 1
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 2 }}>
              <div className="section-header" style={{ textAlign: 'center', marginBottom: '56px' }}>
                <span style={{ color: 'var(--primary-yellow)', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '3px', textTransform: 'uppercase' }}>WHY CHOOSE US</span>
                <h2 style={{ textTransform: 'uppercase', fontWeight: 900, fontSize: '2.6rem', marginTop: '10px', color: '#ffffff', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
                  Excellence In <span style={{ color: 'var(--primary-yellow)' }}>Every Scoop</span>
                </h2>
                <p style={{ color: '#e2e8f0', maxWidth: '600px', margin: '14px auto 0', fontSize: '1.05rem', lineHeight: '1.6', fontWeight: 500 }}>
                  Six reasons serious athletes make EL MEN Nutrition their daily standard.
                </p>
              </div>

              {/* 3x2 Grid Showcase */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

                {/* Feature 1 */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.55)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '20px',
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(251, 191, 36, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.4)';
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(251, 191, 36, 0.12)', border: '1px solid rgba(251, 191, 36, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary-yellow)' }}>
                    <Shield size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', margin: 0, letterSpacing: '0.5px' }}>100% Authentic</h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6', margin: 0, fontWeight: 500 }}>
                    Every product is sealed, serialised and sourced direct — guaranteed genuine.
                  </p>
                </div>

                {/* Feature 2 */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.55)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '20px',
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(251, 191, 36, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.4)';
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(251, 191, 36, 0.12)', border: '1px solid rgba(251, 191, 36, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary-yellow)' }}>
                    <FlaskConical size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', margin: 0, letterSpacing: '0.5px' }}>Lab Tested</h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6', margin: 0, fontWeight: 500 }}>
                    Third-party tested batches for purity, potency and banned substances.
                  </p>
                </div>

                {/* Feature 3 */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.55)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '20px',
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(251, 191, 36, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.4)';
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(251, 191, 36, 0.12)', border: '1px solid rgba(251, 191, 36, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary-yellow)' }}>
                    <Gem size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', margin: 0, letterSpacing: '0.5px' }}>Premium Ingredients</h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6', margin: 0, fontWeight: 500 }}>
                    Clinically dosed actives — no cheap fillers, no proprietary blends.
                  </p>
                </div>

                {/* Feature 4 */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.55)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '20px',
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(251, 191, 36, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.4)';
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(251, 191, 36, 0.12)', border: '1px solid rgba(251, 191, 36, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary-yellow)' }}>
                    <Truck size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', margin: 0, letterSpacing: '0.5px' }}>Fast Delivery</h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6', margin: 0, fontWeight: 500 }}>
                    Dispatched within 24 hours with premium express courier networks.
                  </p>
                </div>

                {/* Feature 5 */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.55)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '20px',
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(251, 191, 36, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.4)';
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(251, 191, 36, 0.12)', border: '1px solid rgba(251, 191, 36, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary-yellow)' }}>
                    <CheckCircle size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', margin: 0, letterSpacing: '0.5px' }}>Quality Assured</h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6', margin: 0, fontWeight: 500 }}>
                    Manufactured in certified cleanroom facilities under strict quality controls.
                  </p>
                </div>

                {/* Feature 6 */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.55)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '20px',
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(251, 191, 36, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.4)';
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(251, 191, 36, 0.12)', border: '1px solid rgba(251, 191, 36, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary-yellow)' }}>
                    <Zap size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', margin: 0, letterSpacing: '0.5px' }}>Science-Backed</h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6', margin: 0, fontWeight: 500 }}>
                    Formulated by clinical sports dieticians and supported by active research.
                  </p>
                </div>

              </div>
            </div>
          </section>

          {/* Trust Badges Certifications Bar */}
          <section className="certifications-bar reveal-fade">
            <div className="container certifications-container">
              <div className="cert-item">
                <div className="cert-icon-wrapper">
                  <Award size={20} />
                </div>
                <div className="cert-info">
                  <h4>GMP Certified</h4>
                  <p>Good Manufacturing Practices</p>
                </div>
              </div>
              <div className="cert-item">
                <div className="cert-icon-wrapper">
                  <Shield size={20} />
                </div>
                <div className="cert-info">
                  <h4>ISO 22000:2018</h4>
                  <p>Food Safety Management</p>
                </div>
              </div>
              <div className="cert-item">
                <div className="cert-icon-wrapper">
                  <Compass size={20} />
                </div>
                <div className="cert-info">
                  <h4>FSSAI Approved</h4>
                  <p>Licensed & Safe Formula</p>
                </div>
              </div>
              <div className="cert-item">
                <div className="cert-icon-wrapper">
                  <RefreshCw size={20} />
                </div>
                <div className="cert-info">
                  <h4>Lab Tested</h4>
                  <p>Every Batch Certified</p>
                </div>
              </div>
              <div className="cert-item">
                <div className="cert-icon-wrapper">
                  <Layers size={20} />
                </div>
                <div className="cert-info">
                  <h4>USA Raw Material</h4>
                  <p>Imported Whey & Minerals</p>
                </div>
              </div>
            </div>
          </section>

          {/* Reviews Section */}
          <div className="reveal-slide-up">
            <ReviewsSection user={user} productsList={productsList} />
          </div>

          {/* FAQ Accordion Section */}
          <div className="reveal-slide-up">
            <FAQSection />
          </div>

          {/* Product Videos Section */}
          <div className="reveal-slide-up">
            <ProductVideosSection />
          </div>

          {/* Contact Section */}
          <div className="reveal-slide-up">
            <ContactSection />
          </div>
        </>
      )}

      {/* Footer */}
      <Footer onNavClick={handleNavClick} />

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/919119119187?text=Hi%20EL%20MEN%20Nutrition%2C%20I%20need%20support%20with%20my%20order."
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float-btn"
        aria-label="Chat on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        <img src="/whastapp.png" alt="WhatsApp" />
      </a>

      {/* Modals & Cart Overlays */}
      <LeadPopupModal />
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {flavourSelectProduct && (
        <FlavourSelectModal
          product={flavourSelectProduct}
          onClose={() => setFlavourSelectProduct(null)}
          onConfirm={(prod, chosenFlavour) => {
            handleAddToCart(prod, chosenFlavour);
          }}
        />
      )}

      {isCartOpen && (
        <CartDrawer
          cartItems={cart}
          onClose={() => setIsCartOpen(false)}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleOpenCheckout}
          user={user}
          userOrderCount={user ? userOrders.filter(o => o.orderStatus !== 'cancelled' && (o.paymentStatus === 'completed' || o.paymentStatus === 'paid' || o.paymentMethod === 'cod')).length : 0}
          onRequireLogin={(priceDetails) => {
            setPendingCheckoutDetails(priceDetails);
            setIsCartOpen(false);
            setAuthPrompt('Please sign in or create an account to proceed to checkout.');
            setIsAuthOpen(true);
          }}
        />
      )}

      {isCheckoutOpen && checkoutPriceDetails && (
        <CheckoutModal
          cartItems={cart}
          priceDetails={checkoutPriceDetails}
          onClose={() => setIsCheckoutOpen(false)}
          onClearCart={handleClearCart}
          user={user}
        />
      )}

      {/* ── WISHLIST DRAWER ── */}
      {isWishlistOpen && (
        <>
          <div className="cart-drawer-overlay" onClick={() => setIsWishlistOpen(false)}></div>
          <div className="cart-drawer" style={{ background: 'var(--bg-dark-900)' }}>
            <div className="cart-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={20} color="#e74c3c" fill="#e74c3c" />
                <h3 style={{ textTransform: 'uppercase', fontWeight: 900, color: 'var(--text-white)' }}>My Wishlist</h3>
              </div>
              <button className="close-btn" onClick={() => setIsWishlistOpen(false)} aria-label="Close Wishlist">
                <X size={24} />
              </button>
            </div>

            <div className="cart-items" style={{ padding: '20px' }}>
              {wishlist.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '12px' }}>
                  <Heart size={48} color="#e74c3c" fill="none" />
                  <p style={{ color: 'var(--text-muted)' }}>Your wishlist is currently empty.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {productsList
                    .filter(p => wishlist.map(String).includes(getProductId(p)))
                    .map(product => (
                      <div
                        className="cart-item animate-fade-in"
                        key={getProductId(product)}
                        style={{
                          display: 'flex',
                          gap: '16px',
                          backgroundColor: 'var(--bg-dark-800)',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid var(--bg-dark-600)',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ width: '60px', height: '60px', borderRadius: '4px', background: 'var(--bg-dark-950)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {product.image ? (
                            <img src={product.image.startsWith('http') ? product.image : `${API_BASE_URL}${product.image}`} alt={product.name} style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
                          ) : (
                            <div className="jar-graphic" style={{ height: '45px', width: '35px', padding: '2px', borderRadius: '4px', transform: 'scale(0.8)' }}>
                              <div className="jar-lid" style={{ height: '3px', width: '25px' }}></div>
                              <div className="jar-label" style={{ background: product.themeColor || 'var(--bg-dark-700)', marginTop: '2px' }}>
                                <div style={{ fontSize: '0.35rem', color: '#fff', textAlign: 'center' }}>EL</div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-white)', fontWeight: 'bold', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h4>
                          <div style={{ fontSize: '0.85rem', color: 'var(--primary-yellow-hover)', fontWeight: 'bold' }}>₹{((product.price && Number(product.price) > 0) ? Number(product.price) : Number(product.originalPrice || 0)).toLocaleString('en-IN')}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '6px 10px', fontSize: '0.7rem' }}
                            onClick={() => {
                              handleAddToCart(product);
                              setIsWishlistOpen(false);
                            }}
                          >
                            Add
                          </button>
                          <button
                            className="btn-icon"
                            style={{ color: 'var(--primary-red)', alignSelf: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
                            onClick={() => handleToggleWishlist(getProductId(product))}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── PROFILE & ORDERS MODAL ── */}
      {isProfileOpen && user && (
        <div className="modal-overlay" onClick={() => setIsProfileOpen(false)}>
          <div
            className="modal-content animate-fade-in"
            style={{
              maxWidth: '680px',
              background: 'var(--bg-dark-900)',
              border: '1px solid var(--bg-dark-600)',
              borderRadius: '20px',
              padding: '0',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header Banner ── */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1f1f1f 100%)',
              borderBottom: '1px solid var(--bg-dark-600)',
              padding: '28px 32px 20px',
              position: 'relative'
            }}>
              <button
                className="btn-icon"
                onClick={() => setIsProfileOpen(false)}
                style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: 'rgba(255,255,255,0.08)', borderRadius: '50%',
                  width: '36px', height: '36px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', border: 'none',
                  cursor: 'pointer', color: 'var(--text-white)', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Avatar circle */}
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary-yellow), #f39c12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, boxShadow: '0 4px 20px rgba(255,190,0,0.3)'
                }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1a1a1a', textTransform: 'uppercase' }}>
                    {user.name ? user.name.charAt(0) : 'U'}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary-yellow)', fontWeight: 700, marginBottom: '2px' }}>Member Account</div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', margin: 0, textTransform: 'uppercase' }}>
                    {user.name}
                  </h2>
                </div>
              </div>
            </div>

            {/* ── Body ── */}
            <div style={{ padding: '24px 32px 32px' }}>

              {/* Contact Info Row */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '12px', marginBottom: '28px'
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: 'var(--bg-dark-800)', borderRadius: '10px',
                  padding: '14px 16px', border: '1px solid var(--bg-dark-700)'
                }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '8px',
                    background: 'rgba(255,190,0,0.12)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Mail size={16} style={{ color: 'var(--primary-yellow)' }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Email</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                  </div>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: 'var(--bg-dark-800)', borderRadius: '10px',
                  padding: '14px 16px', border: '1px solid var(--bg-dark-700)'
                }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '8px',
                    background: 'rgba(255,190,0,0.12)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Phone size={16} style={{ color: 'var(--primary-yellow)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Phone</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-white)' }}>{user.phone || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Orders Section Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShoppingBag size={18} style={{ color: 'var(--primary-yellow)' }} />
                  <h3 style={{
                    textTransform: 'uppercase', fontWeight: 900, margin: 0,
                    fontSize: '1rem', color: 'var(--text-white)', letterSpacing: '0.5px'
                  }}>
                    Order History
                  </h3>
                </div>
                <span style={{
                  background: 'rgba(255,190,0,0.15)', color: 'var(--primary-yellow)',
                  fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px',
                  borderRadius: '20px', border: '1px solid rgba(255,190,0,0.3)',
                  textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>
                  {userOrders.length} {userOrders.length === 1 ? 'Order' : 'Orders'}
                </span>
              </div>

              {/* Orders List */}
              <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
                {userOrders.length === 0 ? (
                  <div style={{
                    textAlign: 'center', padding: '40px 24px',
                    background: 'var(--bg-dark-800)', borderRadius: '12px',
                    border: '1px dashed var(--bg-dark-600)'
                  }}>
                    <Package size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>No orders placed yet.</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>Your order history will appear here.</p>
                  </div>
                ) : (
                  userOrders.map((order, index) => {
                    const status = order.orderStatus || 'processing';
                    const statusConfig = {
                      processing: { color: '#f39c12', bg: 'rgba(243,156,18,0.12)', border: 'rgba(243,156,18,0.3)', icon: <Clock size={12} /> },
                      confirmed: { color: '#2ecc71', bg: 'rgba(46,204,113,0.12)', border: 'rgba(46,204,113,0.3)', icon: <CheckCircle2 size={12} /> },
                      shipped: { color: '#3498db', bg: 'rgba(52,152,219,0.12)', border: 'rgba(52,152,219,0.3)', icon: <TruckIcon size={12} /> },
                      delivered: { color: '#27ae60', bg: 'rgba(39,174,96,0.12)', border: 'rgba(39,174,96,0.3)', icon: <CheckCircle2 size={12} /> },
                      cancelled: { color: '#e74c3c', bg: 'rgba(231,76,60,0.12)', border: 'rgba(231,76,60,0.3)', icon: <XCircle size={12} /> },
                    };
                    const cfg = statusConfig[status] || statusConfig.processing;

                    return (
                      <div
                        key={order._id || index}
                        style={{
                          background: 'var(--bg-dark-800)',
                          border: '1px solid var(--bg-dark-700)',
                          borderRadius: '12px',
                          padding: '16px',
                          transition: 'border-color 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--bg-dark-600)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bg-dark-700)'}
                      >
                        {/* Order top row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>ORDER</span>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff', letterSpacing: '0.5px' }}>
                              #{order._id ? order._id.slice(-8).toUpperCase() : 'N/A'}
                            </span>
                          </div>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            background: cfg.bg, color: cfg.color,
                            border: `1px solid ${cfg.border}`,
                            fontSize: '0.65rem', fontWeight: 800,
                            padding: '3px 10px', borderRadius: '20px',
                            textTransform: 'uppercase', letterSpacing: '0.5px'
                          }}>
                            {cfg.icon} {status}
                          </span>
                        </div>

                        {/* Items */}
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)', lineHeight: '1.5', marginBottom: '10px' }}>
                          {order.items ? order.items.map(item => (
                            <span key={item.name} style={{ display: 'inline-block', background: 'var(--bg-dark-700)', borderRadius: '6px', padding: '2px 8px', marginRight: '6px', marginBottom: '4px', fontSize: '0.78rem' }}>
                              {item.name} × {item.quantity}
                            </span>
                          )) : '—'}
                        </div>

                        {/* Bottom row: date & total */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--bg-dark-700)', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                            <Calendar size={12} />
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </div>

                          {/* If AWB number is attached, show Track button */}
                          {order.trackingNumber && (
                            <button
                              className="btn btn-primary"
                              onClick={() => {
                                setIsProfileOpen(false);
                                setTrackingAwb(order.trackingNumber);
                                setActiveTab('track-order');
                              }}
                              style={{
                                padding: '4px 10px',
                                fontSize: '0.7rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                textTransform: 'uppercase',
                                fontWeight: 800,
                                borderRadius: '15px'
                              }}
                            >
                              <TruckIcon size={12} /> Track
                            </button>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 900, color: 'var(--primary-yellow)', fontSize: '1rem' }}>
                            <IndianRupee size={14} />
                            {order.totalAmount ? order.totalAmount.toLocaleString('en-IN') : 0}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Logout Button */}
              <button
                className="btn btn-secondary"
                style={{
                  width: '100%', marginTop: '24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  color: 'var(--primary-red)', borderColor: 'rgba(193,0,0,0.3)',
                  background: 'rgba(193,0,0,0.05)', fontSize: '0.85rem', fontWeight: 800
                }}
                onClick={() => { handleLogout(); setIsProfileOpen(false); }}
              >
                <LogOut size={16} /> Sign Out
              </button>

            </div>
          </div>
        </div>
      )}

      {isAuthOpen && (
        <AuthModal
          onClose={() => { setIsAuthOpen(false); setAuthPrompt(''); }}
          onAuthSuccess={handleAuthSuccess}
          promptMessage={authPrompt}
        />
      )}

      {isDisclaimerOpen && (
        <DisclaimerModal
          onClose={() => setIsDisclaimerOpen(false)}
        />
      )}

      {isTermsOpen && (
        <TermsPolicyModal
          initialTab={legalActiveTab}
          onClose={() => setIsTermsOpen(false)}
        />
      )}

      {isReturnPolicyOpen && (
        <ReturnPolicyModal
          onClose={() => setIsReturnPolicyOpen(false)}
        />
      )}

      <LeadPopupModal />

      <BusinessEnquiryModal
        isOpen={isBusinessEnquiryOpen}
        onClose={() => setIsBusinessEnquiryOpen(false)}
      />

      <UpcomingProductsModal
        isOpen={isUpcomingOpen}
        initialCategory={upcomingCategory}
        onClose={() => setIsUpcomingOpen(false)}
      />

    </div>
  );
}
