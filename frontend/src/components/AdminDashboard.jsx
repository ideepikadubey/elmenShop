import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Box, IndianRupee, AlertCircle, Plus, Edit2, Trash2, CheckCircle2, RotateCw, Filter, Eye, Truck, User } from 'lucide-react';

const CATEGORIES = [
  { key: 'proteins', label: 'Proteins' },
  { key: 'gainers', label: 'Gainers' },
  { key: 'preworkouts', label: 'Pre-Workout' },
  { key: 'wellness', label: 'Wellness/Ayurveda' },
  { key: 'performance', label: 'Performance/Herbs' }
];

const THEME_PRESETS = [
  { name: 'Dark Gray', value: 'linear-gradient(135deg, #2e2e2e, #1a1a1a)' },
  { name: 'Pure Black', value: 'linear-gradient(135deg, #111, #333)' },
  { name: 'Flame Red', value: 'linear-gradient(135deg, #c0392b, #1a0505)' },
  { name: 'Rust Orange', value: 'linear-gradient(135deg, #d35400, #2c3e50)' },
  { name: 'Ocean Blue', value: 'linear-gradient(135deg, #2980b9, #2c3e50)' },
  { name: 'Forest Green', value: 'linear-gradient(135deg, #27ae60, #145a32)' },
  { name: 'Royal Purple', value: 'linear-gradient(135deg, #8e44ad, #2c3e50)' },
  { name: 'Sun Gold', value: 'linear-gradient(135deg, #f1c40f, #f39c12)' }
];

export default function AdminDashboard({ onRefreshStoreProducts, onLogout, onGoToStore }) {
  const [subTab, setSubTab] = useState('overview'); // overview, products, orders, queries, offers
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search and Filter states
  const [productSearch, setProductSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');

  // Product Add/Edit Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means adding a new product
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', subtitle: '', category: 'proteins', price: '', originalPrice: '',
    weight: '', servingSize: '', servingsCount: '', protein: '',
    features: '', details: '', badge: '', themeColor: THEME_PRESETS[0].value, stock: '100',
    nutritionFactsInput: [{ key: '', value: '' }]
  });

  // Offer Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerForm, setOfferForm] = useState({
    title: '', description: '', code: '', discountType: 'percentage', discountValue: '',
    startDate: '', endDate: '', targetProducts: []
  });

  const getHeaders = () => {
    const token = localStorage.getItem('elmen_token');
    return {
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('elmen_token');
      if (!token) {
        throw new Error('Admin authentication token missing.');
      }

      // Fetch products
      const prodRes = await axios.get('${API_BASE_URL}/api/products?limit=100');
      const prodData = prodRes.data;
      if (prodData.success) {
        setProducts(prodData.products);
      }

      // Fetch orders
      const orderRes = await axios.get('${API_BASE_URL}/api/orders?limit=100', {
        headers: getHeaders()
      });
      const orderData = orderRes.data;
      if (orderData.success) {
        setOrders(orderData.orders);
      }

      // Fetch enquiries
      const enqRes = await axios.get('${API_BASE_URL}/api/enquiries', {
        headers: getHeaders()
      });
      const enqData = enqRes.data;
      if (enqData.success) {
        setEnquiries(enqData.enquiries);
      }

      // Fetch offers
      const offRes = await axios.get('${API_BASE_URL}/api/offers', {
        headers: getHeaders()
      });
      const offData = offRes.data;
      if (offData.success) {
        setOffers(offData.offers);
      }


    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to fetch admin dashboard records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDragStart = (e, idx) => {
    setDraggedIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropNew = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const reordered = [...selectedFiles];
    const item = reordered[draggedIndex];
    reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, item);
    setSelectedFiles(reordered);
    setDraggedIndex(null);
  };

  const handleDropExisting = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    if (!editingProduct) return;
    const currentList = editingProduct.images && editingProduct.images.length > 0
      ? [...editingProduct.images]
      : [editingProduct.image].filter(Boolean);
    const item = currentList[draggedIndex];
    currentList.splice(draggedIndex, 1);
    currentList.splice(index, 0, item);
    setEditingProduct({
      ...editingProduct,
      image: currentList[0],
      images: currentList
    });
    setDraggedIndex(null);
  };

  // Product CRUD
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setSelectedFiles([]);
    setProductForm({
      name: '', subtitle: '', category: 'proteins', price: '', originalPrice: '',
      weight: '', servingSize: '', servingsCount: '', protein: '',
      features: '', details: '', badge: '', themeColor: THEME_PRESETS[0].value, stock: '100',
      nutritionFactsInput: [{ key: 'Protein', value: '24g' }, { key: 'BCAAs', value: '5.5g' }]
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setSelectedFiles([]);

    // Map Map/Object to key-value inputs array
    const factsArray = prod.nutritionFacts
      ? Object.entries(prod.nutritionFacts).map(([k, v]) => ({ key: k, value: v }))
      : [{ key: '', value: '' }];

    setProductForm({
      name: prod.name,
      subtitle: prod.subtitle || '',
      category: prod.category,
      price: prod.price.toString(),
      originalPrice: prod.originalPrice ? prod.originalPrice.toString() : '',
      weight: prod.weight || '',
      servingSize: prod.servingSize || '',
      servingsCount: prod.servingsCount ? prod.servingsCount.toString() : '0',
      protein: prod.protein || '',
      features: Array.isArray(prod.features) ? prod.features.join(', ') : '',
      details: prod.details || '',
      badge: prod.badge || '',
      themeColor: prod.themeColor || THEME_PRESETS[0].value,
      stock: prod.stock ? prod.stock.toString() : '0',
      nutritionFactsInput: factsArray.length > 0 ? factsArray : [{ key: '', value: '' }]
    });
    setIsProductModalOpen(true);
  };

  const handleNutritionFactChange = (index, field, val) => {
    const list = [...productForm.nutritionFactsInput];
    list[index][field] = val;
    setProductForm({ ...productForm, nutritionFactsInput: list });
  };

  const addNutritionFactRow = () => {
    setProductForm({
      ...productForm,
      nutritionFactsInput: [...productForm.nutritionFactsInput, { key: '', value: '' }]
    });
  };

  const removeNutritionFactRow = (index) => {
    const list = [...productForm.nutritionFactsInput];
    list.splice(index, 1);
    setProductForm({ ...productForm, nutritionFactsInput: list });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      // Map nutrition facts array back to object Map
      const factsObj = {};
      productForm.nutritionFactsInput.forEach(row => {
        if (row.key.trim()) {
          factsObj[row.key.trim()] = row.value.trim();
        }
      });

      // Split features by comma
      const featuresArray = productForm.features
        ? productForm.features.split(',').map(f => f.trim()).filter(Boolean)
        : [];

      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('subtitle', productForm.subtitle);
      formData.append('category', productForm.category);
      formData.append('price', Number(productForm.price));
      formData.append('originalPrice', Number(productForm.originalPrice || 0));
      formData.append('weight', productForm.weight);
      formData.append('servingSize', productForm.servingSize);
      formData.append('servingsCount', Number(productForm.servingsCount || 0));
      formData.append('protein', productForm.protein);
      formData.append('features', JSON.stringify(featuresArray));
      formData.append('details', productForm.details);
      formData.append('badge', productForm.badge);
      formData.append('themeColor', productForm.themeColor);
      formData.append('stock', Number(productForm.stock));
      formData.append('nutritionFacts', JSON.stringify(factsObj));

      if (selectedFiles && selectedFiles.length > 0) {
        selectedFiles.forEach(file => {
          formData.append('images', file);
        });
      } else if (editingProduct && editingProduct.images) {
        formData.append('images', JSON.stringify(editingProduct.images));
      }

      const url = editingProduct
        ? `${API_BASE_URL}/api/products/${editingProduct._id}`
        : '${API_BASE_URL}/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await axios({
        url,
        method,
        headers: {
          ...getHeaders(),
          'Content-Type': 'multipart/form-data'
        },
        data: formData
      });

      const data = response.data;
      showSuccess(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
      setIsProductModalOpen(false);
      fetchAdminData(); // reload
      if (onRefreshStoreProducts) onRefreshStoreProducts(); // trigger storefront reload
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? it will be soft-deleted.')) return;
    setIsLoading(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
        headers: getHeaders()
      });
      const data = response.data;
      showSuccess('Product deleted successfully!');
      fetchAdminData();
      if (onRefreshStoreProducts) onRefreshStoreProducts();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStockInline = async (id, currentStock, newStockStr) => {
    const newStock = parseInt(newStockStr);
    if (isNaN(newStock) || newStock < 0) return;
    if (currentStock === newStock) return;

    try {
      const response = await axios.put(`${API_BASE_URL}/api/products/${id}/stock`, {
        stock: newStock
      }, {
        headers: getHeaders()
      });
      const data = response.data;
      showSuccess(`Stock updated successfully to ${newStock} units.`);
      fetchAdminData();
      if (onRefreshStoreProducts) onRefreshStoreProducts();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update stock.');
    }
  };

  // Order Status update
  const handleOrderStatusUpdate = async (orderId, newStatus, trackingNum) => {
    try {
      const payload = { orderStatus: newStatus };
      if (trackingNum !== undefined) payload.trackingNumber = trackingNum;

      const response = await axios.put(`${API_BASE_URL}/api/orders/${orderId}/status`, payload, {
        headers: getHeaders()
      });
      showSuccess(`Order updated successfully!`);
      fetchAdminData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message);
    }
  };

  // Stats Calculations
  const totalRevenue = orders
    .filter(o => o.orderStatus !== 'cancelled')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const outOfStockCount = products.filter(p => p.stock <= 0).length;

  // Filtered lists
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o =>
    orderFilter === 'all' || o.orderStatus === orderFilter
  );

  return (
    <div className="admin-dashboard-container animate-fade-in" style={{ padding: '40px 0', minHeight: '80vh', backgroundColor: 'var(--bg-dark-900)' }}>
      {/* Dynamic Scoped CSS Styles injected directly */}
      <style>{`
        .admin-tab-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          font-weight: 700;
          font-size: 0.9rem;
          padding: 10px 20px;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: var(--transition-smooth);
        }
        .admin-tab-btn.active {
          color: var(--primary-yellow);
          border-bottom: 2px solid var(--primary-yellow);
        }
        .admin-stat-card {
          background: var(--bg-dark-800);
          border: 1px solid var(--bg-dark-600);
          border-radius: var(--border-radius);
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: var(--shadow-glow);
        }
        .admin-stat-icon {
          background: rgba(255, 190, 0, 0.1);
          color: var(--primary-yellow);
          padding: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .admin-stat-val {
          font-size: 1.8rem;
          font-weight: 900;
          color: var(--text-white);
          margin-top: 4px;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
          background: var(--bg-dark-800);
          border: 1px solid var(--bg-dark-600);
          border-radius: var(--border-radius);
          overflow: hidden;
        }
        .admin-table th, .admin-table td {
          padding: 14px 18px;
          text-align: left;
          border-bottom: 1px solid var(--bg-dark-600);
          font-size: 0.88rem;
        }
        .admin-table th {
          background: var(--bg-dark-700);
          color: var(--text-white);
          font-weight: 800;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.5px;
        }
        .admin-badge {
          display: inline-block;
          padding: 4px 8px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          border-radius: 4px;
        }
        .badge-processing { background: #e3f2fd; color: #1565c0; }
        .badge-confirmed { background: #e8f5e9; color: #2e7d32; }
        .badge-shipped { background: #fff3e0; color: #e65100; }
        .badge-delivered { background: rgba(39, 174, 96, 0.1); color: #27ae60; }
        .badge-cancelled { background: rgba(193, 0, 0, 0.1); color: var(--primary-red); }
        .admin-modal {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
        }
        .admin-modal-content {
          background: var(--bg-dark-800);
          border: 1px solid var(--bg-dark-600);
          border-radius: var(--border-radius);
          width: 90%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 30px;
          position: relative;
        }
        .preset-color-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: 0.2s;
        }
        .preset-color-btn.active {
          border-color: var(--primary-yellow);
          transform: scale(1.1);
        }
      `}</style>

      <div className="container">
        {/* Header Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ textTransform: 'uppercase', fontWeight: 900, fontSize: '2rem' }}>
              🛠️ SYSTEM <span>ADMIN PANEL</span>
            </h1>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginTop: '4px' }}>
              Real-time server records, product inventories, and e-commerce order workflows.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              className="btn btn-secondary"
              style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.8rem' }}
              onClick={fetchAdminData}
              disabled={isLoading}
            >
              <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh Data
            </button>
            <button
              className="btn btn-secondary"
              style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.8rem' }}
              onClick={onGoToStore}
            >
              Exit Admin Panel
            </button>
            <button
              className="btn btn-primary"
              style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.8rem', backgroundColor: 'var(--primary-red)', borderColor: 'var(--primary-red)' }}
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(193, 0, 0, 0.05)', color: 'var(--primary-red)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(193, 0, 0, 0.15)', display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: '0.9rem' }}>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div style={{ backgroundColor: 'rgba(39, 174, 96, 0.05)', color: '#27ae60', padding: '16px', borderRadius: '8px', border: '1px solid rgba(39, 174, 96, 0.15)', display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
            <CheckCircle2 size={20} />
            <span style={{ fontSize: '0.9rem' }}>{successMsg}</span>
          </div>
        )}

        {/* Sub Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--bg-dark-600)', marginBottom: '32px', flexWrap: 'wrap', gap: '8px' }}>
          <button className={`admin-tab-btn ${subTab === 'overview' ? 'active' : ''}`} onClick={() => setSubTab('overview')}>
            OVERVIEW
          </button>
          <button className={`admin-tab-btn ${subTab === 'products' ? 'active' : ''}`} onClick={() => setSubTab('products')}>
            PRODUCTS INVENTORY ({products.length})
          </button>
          <button className={`admin-tab-btn ${subTab === 'orders' ? 'active' : ''}`} onClick={() => setSubTab('orders')}>
            ORDERS JOURNAL ({orders.length})
          </button>
          <button className={`admin-tab-btn ${subTab === 'queries' ? 'active' : ''}`} onClick={() => setSubTab('queries')}>
            BUSINESS ENQUIRIES ({enquiries.length})
          </button>
          <button className={`admin-tab-btn ${subTab === 'offers' ? 'active' : ''}`} onClick={() => setSubTab('offers')}>
            PROMOTIONS & OFFERS ({offers.length})
          </button>
        </div>

        {/* ── SUB TAB: OVERVIEW ── */}
        {subTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  <IndianRupee size={24} />
                </div>
                <div>
                  <span style={{ color: 'var(--text-gray)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Gross Sales</span>
                  <div className="admin-stat-val">₹{totalRevenue.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ color: '#27ae60', backgroundColor: 'rgba(39, 174, 96, 0.1)' }}>
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <span style={{ color: 'var(--text-gray)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Total Orders</span>
                  <div className="admin-stat-val">{orders.length}</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ color: '#1565c0', backgroundColor: 'rgba(21, 101, 192, 0.1)' }}>
                  <Box size={24} />
                </div>
                <div>
                  <span style={{ color: 'var(--text-gray)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Active Catalog Items</span>
                  <div className="admin-stat-val">{products.length}</div>
                </div>
              </div>

              <div className="admin-stat-card" style={{ border: outOfStockCount > 0 ? '1px solid rgba(193, 0, 0, 0.25)' : '1px solid var(--bg-dark-600)' }}>
                <div className="admin-stat-icon" style={{
                  color: outOfStockCount > 0 ? 'var(--primary-red)' : 'var(--text-gray)',
                  backgroundColor: outOfStockCount > 0 ? 'rgba(193, 0, 0, 0.1)' : 'var(--bg-dark-700)'
                }}>
                  <AlertCircle size={24} />
                </div>
                <div>
                  <span style={{ color: 'var(--text-gray)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Out of Stock Warnings</span>
                  <div className="admin-stat-val" style={{ color: outOfStockCount > 0 ? 'var(--primary-red)' : 'inherit' }}>{outOfStockCount}</div>
                </div>
              </div>
            </div>

            {/* Out of stock details list */}
            {outOfStockCount > 0 && (
              <div style={{ background: 'var(--bg-dark-800)', border: '1px solid var(--bg-dark-600)', borderRadius: 'var(--border-radius)', padding: '24px', marginBottom: '40px' }}>
                <h3 style={{ textTransform: 'uppercase', fontWeight: 900, color: 'var(--primary-red)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={18} /> INVENTORY WARNING: OUT OF STOCK PRODUCTS
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {products.filter(p => p.stock <= 0).map(p => (
                    <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--bg-dark-700)', paddingBottom: '10px' }}>
                      <div>
                        <strong style={{ fontSize: '0.95rem' }}>{p.name}</strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '12px', textTransform: 'uppercase' }}>({p.category})</span>
                      </div>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleOpenEditProduct(p)}>
                        Add Stock
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SUB TAB: PRODUCTS INVENTORY ── */}
        {subTab === 'products' && (
          <div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <div className="search-bar" style={{ flex: 1, maxWidth: '400px', backgroundColor: 'var(--bg-dark-800)', border: '1px solid var(--bg-dark-600)' }}>
                <input
                  type="text"
                  placeholder="Search by name or category..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <button className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={handleOpenAddProduct}>
                <Plus size={16} /> Add Supplement
              </button>
            </div>

            {filteredProducts.length === 0 ? (
              <p style={{ color: 'var(--text-gray)', textAlign: 'center', padding: '40px' }}>No products found matching filters.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Theme</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Original Price</th>
                      <th>Stock Quantity</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(p => (
                      <tr key={p._id}>
                        <td>
                          {/* Mini jar preview */}
                          <div style={{ height: '35px', width: '25px', padding: '1px', borderRadius: '2px', border: '1px solid #ddd', background: p.themeColor || 'var(--bg-dark-700)' }}>
                            <div style={{ height: '3px', background: '#333', width: '15px', margin: '0 auto' }}></div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '800' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.subtitle}</div>
                        </td>
                        <td style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold' }}>{p.category}</td>
                        <td style={{ fontWeight: 'bold' }}>₹{p.price.toLocaleString('en-IN')}</td>
                        <td style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                          {p.originalPrice ? `₹${p.originalPrice.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td>
                          {/* Inline Stock editing input */}
                          <input
                            type="number"
                            defaultValue={p.stock}
                            onBlur={(e) => handleUpdateStockInline(p._id, p.stock, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateStockInline(p._id, p.stock, e.target.value);
                            }}
                            style={{ width: '70px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--bg-dark-600)', background: 'var(--bg-dark-900)' }}
                            min="0"
                            title="Update stock (click enter or blur to save)"
                          />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button className="btn-icon" onClick={() => handleOpenEditProduct(p)} title="Edit product info">
                              <Edit2 size={14} />
                            </button>
                            <button className="btn-icon" onClick={() => handleDeleteProduct(p._id)} style={{ color: 'var(--primary-red)' }} title="Delete Product">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── SUB TAB: ORDERS JOURNAL ── */}
        {subTab === 'orders' && (
          <div>
            {/* Filtering status links */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginRight: '16px', color: 'var(--text-gray)', fontSize: '0.85rem' }}>
                <Filter size={16} /> Filter Status:
              </div>
              {['all', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(st => (
                <button
                  key={st}
                  onClick={() => setOrderFilter(st)}
                  className={`category-tab ${orderFilter === st ? 'active' : ''}`}
                  style={{ fontSize: '0.75rem', padding: '6px 12px', border: 'none', borderRadius: '20px' }}
                >
                  {st}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <p style={{ color: 'var(--text-gray)', textAlign: 'center', padding: '40px' }}>No orders matching status filter found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Profile</th>
                      <th>Order Date</th>
                      <th>Items Ordered</th>
                      <th>Grand Total</th>
                      <th>Status Details</th>
                      <th>Change Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(o => (
                      <tr key={o._id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '0.8rem' }}>
                          {o._id.substring(o._id.length - 8).toUpperCase()}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <User size={14} style={{ color: 'var(--text-muted)' }} />
                            <strong style={{ fontSize: '0.85rem' }}>{o.shippingAddress?.fullName}</strong>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '20px' }}>
                            {o.shippingAddress?.email} | {o.shippingAddress?.phone}
                          </div>
                        </td>
                        <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {o.items.map((it, idx) => (
                              <span key={idx} style={{ fontSize: '0.78rem', color: 'var(--text-gray)' }}>
                                • {it.name} (x{it.quantity})
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ fontWeight: '900' }}>₹{o.totalAmount.toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`admin-badge badge-${o.orderStatus}`}>
                            {o.orderStatus}
                          </span>
                          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'uppercase' }}>
                            {o.paymentMethod} • {o.paymentStatus}
                          </span>
                        </td>
                        <td>
                          {/* Dropdown status update action with AWB field */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <select
                              value={o.orderStatus}
                              onChange={(e) => handleOrderStatusUpdate(o._id, e.target.value, o.trackingNumber)}
                              style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--bg-dark-600)', background: 'var(--bg-dark-900)', color: 'var(--text-white)' }}
                            >
                              <option value="processing">Processing</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>

                            <input
                              type="text"
                              placeholder="AWB Tracking #"
                              defaultValue={o.trackingNumber || ''}
                              onBlur={(e) => handleOrderStatusUpdate(o._id, o.orderStatus, e.target.value)}
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.7rem',
                                width: '130px',
                                borderRadius: '4px',
                                border: '1px solid var(--bg-dark-600)',
                                background: 'var(--bg-dark-950)',
                                color: 'var(--text-white)',
                                fontFamily: 'monospace'
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── SUB TAB: BUSINESS ENQUIRIES ── */}
        {subTab === 'queries' && (
          <div>
            <h3 style={{ textTransform: 'uppercase', fontWeight: 900, marginBottom: '20px' }}>
              💬 Customer Business Enquiries
            </h3>
            {enquiries.length === 0 ? (
              <p style={{ color: 'var(--text-gray)', textAlign: 'center', padding: '40px' }}>No business queries submitted yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {enquiries.map(enq => (
                  <div
                    key={enq._id}
                    style={{
                      backgroundColor: 'var(--bg-dark-800)',
                      border: '1px solid var(--bg-dark-600)',
                      borderRadius: 'var(--border-radius)',
                      padding: '20px',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--bg-dark-700)', paddingBottom: '10px', marginBottom: '10px' }}>
                      <div>
                        <strong style={{ fontSize: '1rem', color: 'var(--text-white)' }}>{enq.name}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '12px' }}>
                          ✉️ {enq.email}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(enq.createdAt).toLocaleString()}
                        </span>
                        <span className={`admin-badge badge-${enq.status === 'unread' ? 'processing' : 'confirmed'}`}>
                          {enq.status}
                        </span>
                      </div>
                    </div>

                    <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                      {enq.message}
                    </p>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                      {enq.status === 'unread' && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          onClick={async () => {
                            try {
                              await axios.put(`${API_BASE_URL}/api/enquiries/${enq._id}`, { status: 'read' }, { headers: getHeaders() });
                              showSuccess('Enquiry marked as read.');
                              fetchAdminData();
                            } catch (err) {
                              setErrorMsg('Failed to update enquiry status.');
                            }
                          }}
                        >
                          Mark as Read
                        </button>
                      )}
                      <button
                        className="btn-icon"
                        style={{ color: 'var(--primary-red)' }}
                        onClick={async () => {
                          if (!window.confirm('Delete this enquiry?')) return;
                          try {
                            await axios.delete(`${API_BASE_URL}/api/enquiries/${enq._id}`, { headers: getHeaders() });
                            showSuccess('Enquiry deleted.');
                            fetchAdminData();
                          } catch (err) {
                            setErrorMsg('Failed to delete enquiry.');
                          }
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SUB TAB: PROMOTIONS & OFFERS ── */}
        {subTab === 'offers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ textTransform: 'uppercase', fontWeight: 900, margin: 0 }}>
                🏷️ Campaign Coupons & Discounts
              </h3>
              <button
                className="btn btn-primary"
                style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                onClick={() => {
                  setOfferForm({
                    title: '', description: '', code: '', discountType: 'percentage', discountValue: '',
                    startDate: '', endDate: '', targetProducts: []
                  });
                  setIsOfferModalOpen(true);
                }}
              >
                <Plus size={16} /> Create Offer Code
              </button>
            </div>

            {offers.length === 0 ? (
              <p style={{ color: 'var(--text-gray)', textAlign: 'center', padding: '40px' }}>No active or scheduled promotions found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Coupon Code</th>
                      <th>Campaign Title</th>
                      <th>Discount details</th>
                      <th>Duration validity period</th>
                      <th>Applies To</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map(off => {
                      const now = new Date();
                      const isExpired = new Date(off.endDate) < now;
                      const isScheduled = new Date(off.startDate) > now;
                      let dateStatus = 'Active';
                      let statusBadge = 'confirmed';
                      if (isExpired) {
                        dateStatus = 'Expired';
                        statusBadge = 'cancelled';
                      } else if (isScheduled) {
                        dateStatus = 'Scheduled';
                        statusBadge = 'processing';
                      }

                      return (
                        <tr key={off._id}>
                          <td>
                            <code style={{ fontSize: '1rem', color: 'var(--primary-yellow)', fontWeight: 'bold' }}>
                              {off.code}
                            </code>
                          </td>
                          <td>
                            <strong style={{ fontSize: '0.85rem', display: 'block' }}>{off.title}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{off.description}</span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 'bold' }}>
                              {off.discountType === 'percentage' ? `${off.discountValue}% OFF` : `₹${off.discountValue} OFF`}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.78rem' }}>
                            <div>Start: {new Date(off.startDate).toLocaleString()}</div>
                            <div>End: {new Date(off.endDate).toLocaleString()}</div>
                          </td>
                          <td style={{ fontSize: '0.78rem' }}>
                            {off.targetProducts && off.targetProducts.length > 0 ? (
                              <span>{off.targetProducts.length} Product(s)</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>All Products</span>
                            )}
                          </td>
                          <td>
                            <span className={`admin-badge badge-${statusBadge}`}>
                              {dateStatus}
                            </span>
                            {!off.isActive && (
                              <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--primary-red)', marginTop: '2px' }}>Disabled</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                                onClick={async () => {
                                  try {
                                    await axios.put(`${API_BASE_URL}/api/offers/${off._id}`, { isActive: !off.isActive }, { headers: getHeaders() });
                                    showSuccess('Offer status updated.');
                                    fetchAdminData();
                                  } catch (err) {
                                    setErrorMsg('Failed to toggle offer status.');
                                  }
                                }}
                              >
                                {off.isActive ? 'Disable' : 'Enable'}
                              </button>
                              <button
                                className="btn-icon"
                                style={{ color: 'var(--primary-red)' }}
                                onClick={async () => {
                                  if (!window.confirm('Delete this promotion?')) return;
                                  try {
                                    await axios.delete(`${API_BASE_URL}/api/offers/${off._id}`, { headers: getHeaders() });
                                    showSuccess('Promotion deleted successfully.');
                                    fetchAdminData();
                                  } catch (err) {
                                    setErrorMsg('Failed to delete promotion.');
                                  }
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MODAL: PRODUCT ADD / EDIT ── */}
      {isProductModalOpen && (
        <div className="admin-modal" onClick={() => setIsProductModalOpen(false)}>
          <div className="admin-modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ textTransform: 'uppercase', fontWeight: 900, marginBottom: '20px', borderBottom: '1px solid var(--bg-dark-700)', paddingBottom: '12px' }}>
              {editingProduct ? '✏️ Edit Product Details' : '📦 Add New Supplement'}
            </h2>

            <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Row 1: Name and Subtitle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Supplement Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Clean Whey Protein"
                  />
                </div>
                <div className="form-group">
                  <label>Sub-title / Tagline</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productForm.subtitle}
                    onChange={(e) => setProductForm({ ...productForm, subtitle: e.target.value })}
                    placeholder="e.g. Premium Protein Formula"
                  />
                </div>
              </div>

              {/* Row 2: Category and Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    className="form-input"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Initial Stock *</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    min="0"
                  />
                </div>
              </div>

              {/* Row 3: Prices */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Discounted Price (INR ₹) *</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="e.g. 6499"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Original MRP Price (INR ₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    placeholder="e.g. 7999"
                    min="0"
                  />
                </div>
              </div>

              {/* Row 4: Specs (Weight, Serving Size, Servings Count) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Total weight</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productForm.weight}
                    onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                    placeholder="e.g. 2000g (2kg)"
                  />
                </div>
                <div className="form-group">
                  <label>Serving Size</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productForm.servingSize}
                    onChange={(e) => setProductForm({ ...productForm, servingSize: e.target.value })}
                    placeholder="e.g. 1 Scoop (33g)"
                  />
                </div>
                <div className="form-group">
                  <label>Servings Count</label>
                  <input
                    type="number"
                    className="form-input"
                    value={productForm.servingsCount}
                    onChange={(e) => setProductForm({ ...productForm, servingsCount: e.target.value })}
                    placeholder="60"
                    min="0"
                  />
                </div>
              </div>

              {/* Row 5: Protein content and Badge */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Protein per Serving</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productForm.protein}
                    onChange={(e) => setProductForm({ ...productForm, protein: e.target.value })}
                    placeholder="e.g. 24g"
                  />
                </div>
                <div className="form-group">
                  <label>Promo Badge Text</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    placeholder="e.g. Best Seller"
                  />
                </div>
              </div>

              {/* Theme Jar Color Preset Pickers */}
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px' }}>Supplement Jar Color Theme</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {THEME_PRESETS.map((col, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`preset-color-btn ${productForm.themeColor === col.value ? 'active' : ''}`}
                      style={{ background: col.value }}
                      onClick={() => setProductForm({ ...productForm, themeColor: col.value })}
                      title={col.name}
                    />
                  ))}
                </div>
              </div>

              {/* Product Image File Selector */}
              <div className="form-group">
                <label>Upload Supplement Images (Select multiple)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="form-input"
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                  style={{ border: '1px dashed var(--bg-dark-600)', padding: '12px' }}
                />

                {/* Previews of selected files */}
                {selectedFiles.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                      Drag and drop images to reorder (the first image will be the primary main photo)
                    </span>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {selectedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDropNew(e, idx)}
                          style={{
                            position: 'relative',
                            cursor: 'grab',
                            border: draggedIndex === idx ? '2px dashed var(--primary-yellow)' : '1.5px solid var(--bg-dark-600)',
                            borderRadius: '8px',
                            padding: '4px',
                            background: '#1a1a1a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '68px',
                            height: '68px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                            transition: 'all 0.2s'
                          }}
                          onDragEnd={() => setDraggedIndex(null)}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`selected preview ${idx}`}
                            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                          />
                          {idx === 0 && (
                            <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--primary-yellow)', color: '#000', fontSize: '0.55rem', fontWeight: 900, textAlign: 'center', padding: '1px 0', textTransform: 'uppercase' }}>Main</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Previews of current images when editing */}
                {editingProduct && !selectedFiles.length && (
                  <div style={{ marginTop: '10px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                      Current Images (Drag and drop to reorder, first image will be the main photo):
                    </span>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {(editingProduct.images && editingProduct.images.length > 0
                        ? editingProduct.images
                        : [editingProduct.image].filter(Boolean)
                      ).map((img, idx) => (
                        <div
                          key={idx}
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDropExisting(e, idx)}
                          style={{
                            position: 'relative',
                            cursor: 'grab',
                            border: draggedIndex === idx ? '2px dashed var(--primary-yellow)' : '1.5px solid var(--bg-dark-600)',
                            borderRadius: '8px',
                            padding: '4px',
                            background: '#1a1a1a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '68px',
                            height: '68px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                            transition: 'all 0.2s'
                          }}
                          onDragEnd={() => setDraggedIndex(null)}
                        >
                          <img
                            src={img.startsWith('http') ? img : `${API_BASE_URL}${img}`}
                            alt={`current preview ${idx}`}
                            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                          />
                          {idx === 0 && (
                            <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--primary-yellow)', color: '#000', fontSize: '0.55rem', fontWeight: 900, textAlign: 'center', padding: '1px 0', textTransform: 'uppercase' }}>Main</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Features and Description */}
              <div className="form-group">
                <label>Core Features (Comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={productForm.features}
                  onChange={(e) => setProductForm({ ...productForm, features: e.target.value })}
                  placeholder="Builds Lean Muscle, Faster Recovery, Premium Quality"
                />
              </div>

              <div className="form-group">
                <label>Product Details Description</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '80px', padding: '12px', fontFamily: 'inherit' }}
                  value={productForm.details}
                  onChange={(e) => setProductForm({ ...productForm, details: e.target.value })}
                  placeholder="Provide product descriptions here..."
                />
              </div>

              {/* Nutrition Supplement Facts key values */}
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '10px' }}>Supplement Facts (Nutrition values)</label>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {productForm.nutritionFactsInput.map((fact, index) => (
                    <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Nutrient (e.g. BCAAs)"
                        className="form-input"
                        value={fact.key}
                        onChange={(e) => handleNutritionFactChange(index, 'key', e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <input
                        type="text"
                        placeholder="Amount (e.g. 5.5g)"
                        className="form-input"
                        value={fact.value}
                        onChange={(e) => handleNutritionFactChange(index, 'value', e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => removeNutritionFactRow(index)}
                        disabled={productForm.nutritionFactsInput.length <= 1}
                        style={{ color: 'var(--primary-red)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', alignSelf: 'flex-start', padding: '6px 12px' }}
                    onClick={addNutritionFactRow}
                  >
                    + Add Nutrient Row
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', borderTop: '1px solid var(--bg-dark-700)', paddingTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsProductModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Saving Product...' : editingProduct ? 'Save Updates' : 'Add Supplement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: OFFER ADD ── */}
      {isOfferModalOpen && (
        <div className="admin-modal" onClick={() => setIsOfferModalOpen(false)}>
          <div className="admin-modal-content animate-fade-in" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ textTransform: 'uppercase', fontWeight: 900, marginBottom: '20px', borderBottom: '1px solid var(--bg-dark-700)', paddingBottom: '12px' }}>
              🏷️ Create Promotion Coupon
            </h2>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsLoading(true);
                setErrorMsg('');
                try {
                  const body = {
                    title: offerForm.title,
                    description: offerForm.description,
                    code: offerForm.code.toUpperCase(),
                    discountType: offerForm.discountType,
                    discountValue: Number(offerForm.discountValue),
                    startDate: offerForm.startDate,
                    endDate: offerForm.endDate,
                    targetProducts: offerForm.targetProducts
                  };

                  await axios.post('${API_BASE_URL}/api/offers', body, { headers: getHeaders() });
                  showSuccess('Promotion Coupon created successfully!');
                  setIsOfferModalOpen(false);
                  fetchAdminData();
                } catch (err) {
                  setErrorMsg(err.response?.data?.message || err.message || 'Failed to create offer.');
                } finally {
                  setIsLoading(false);
                }
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div className="form-group">
                <label>Offer Title *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={offerForm.title}
                  onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                  placeholder="e.g. New Year Fitness Discount"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  className="form-input"
                  value={offerForm.description}
                  onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                  placeholder="e.g. Flat ₹500 off on all preworkouts"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Coupon Code *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={offerForm.code}
                    onChange={(e) => setOfferForm({ ...offerForm, code: e.target.value })}
                    placeholder="e.g. FIT500"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div className="form-group">
                  <label>Discount Type *</label>
                  <select
                    className="form-input"
                    value={offerForm.discountType}
                    onChange={(e) => setOfferForm({ ...offerForm, discountType: e.target.value })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Discount Value *</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  value={offerForm.discountValue}
                  onChange={(e) => setOfferForm({ ...offerForm, discountValue: e.target.value })}
                  placeholder={offerForm.discountType === 'percentage' ? 'e.g. 10 for 10%' : 'e.g. 500 for ₹500'}
                  min="0"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    className="form-input"
                    value={offerForm.startDate}
                    onChange={(e) => setOfferForm({ ...offerForm, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    className="form-input"
                    value={offerForm.endDate}
                    onChange={(e) => setOfferForm({ ...offerForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Target Products Restriction (Optional)</label>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Hold Ctrl/Cmd to select multiple products. Leave empty to apply to all products.
                </span>
                <select
                  multiple
                  className="form-input"
                  style={{ height: '110px' }}
                  value={offerForm.targetProducts}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setOfferForm({ ...offerForm, targetProducts: values });
                  }}
                >
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', borderTop: '1px solid var(--bg-dark-700)', paddingTop: '20px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsOfferModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Creating Campaign...' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
