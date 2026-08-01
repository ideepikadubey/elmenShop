import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "../config/api";
import { ShoppingBag, Box, IndianRupee, AlertCircle, Plus, Edit2, Trash2, CheckCircle2, RotateCw, Filter, Eye, Truck, User, ArrowUp, ArrowDown, GripVertical, Save } from 'lucide-react';

const CATEGORIES = [
  { key: 'proteins', label: 'Proteins' },
  { key: 'gainers', label: 'Gainers' },
  { key: 'preworkouts', label: 'Pre-Workout' },
  { key: 'wellness', label: 'Wellness' },
  { key: 'accessories', label: 'Accessories' },
  { key: 'performance', label: 'Performance/Herbs' }
];

export default function AdminDashboard({ onRefreshStoreProducts, onLogout, onGoToStore }) {
  const [subTab, setSubTab] = useState('overview'); // overview, products, orders, queries, offers
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [offers, setOffers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [leadSearch, setLeadSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [isUploadingExcel, setIsUploadingExcel] = useState(false);
  const [verificationStats, setVerificationStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [productSearch, setProductSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [productSortOrder, setProductSortOrder] = useState('custom'); // 'custom' | 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'name_asc'
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [draggedTableProductIndex, setDraggedTableProductIndex] = useState(null);
  const [orderFilter, setOrderFilter] = useState('all');

  // Product Add/Edit Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means adding a new product
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', subtitle: '', category: 'proteins', price: '', originalPrice: '',
    weight: '', servingSize: '', servingsCount: '', protein: '',
    features: '', flavours: ['Kesar Badam', 'Cookies & Cream', 'Chocolate', 'Malai Kulfi'], details: '', badge: '', stock: '100',
    nutritionFactsInput: [{ key: '', value: '' }]
  });

  // Offer Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerForm, setOfferForm] = useState({
    title: '', description: '', code: '', discountType: 'percentage', discountValue: '',
    customerType: 'online', image: '',
    startDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    targetProducts: []
  });

  const handleOpenEditOffer = (off) => {
    setEditingOffer(off);
    setOfferForm({
      title: off.title || '',
      description: off.description || '',
      code: off.code || '',
      discountType: off.discountType || 'percentage',
      discountValue: off.discountValue !== undefined ? String(off.discountValue) : '',
      customerType: off.customerType || 'online',
      image: off.image || '',
      startDate: off.startDate ? new Date(new Date(off.startDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
      endDate: off.endDate ? new Date(new Date(off.endDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
      targetProducts: off.targetProducts ? off.targetProducts.map(p => typeof p === 'object' ? p._id : p) : []
    });
    setIsOfferModalOpen(true);
  };

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
      const prodRes = await axios.get(`${API_BASE_URL}/api/products?limit=100`);
      const prodData = prodRes.data;
      if (prodData.success) {
        setProducts(prodData.products);
      }

      // Fetch orders
      const orderRes = await axios.get(`${API_BASE_URL}/api/orders?limit=100`, {
        headers: getHeaders()
      });
      const orderData = orderRes.data;
      if (orderData.success) {
        setOrders(orderData.orders);
      }

      // Fetch enquiries
      const enqRes = await axios.get(`${API_BASE_URL}/api/enquiries`, {
        headers: getHeaders()
      });
      const enqData = enqRes.data;
      if (enqData.success) {
        setEnquiries(enqData.enquiries);
      }

      // Fetch offers
      const offRes = await axios.get(`${API_BASE_URL}/api/offers`, {
        headers: getHeaders()
      });
      const offData = offRes.data;
      if (offData.success) {
        setOffers(offData.offers);
      }

      // Fetch leads
      try {
        const leadRes = await axios.get(`${API_BASE_URL}/api/leads`, {
          headers: getHeaders()
        });
        if (leadRes.data && leadRes.data.success) {
          setLeads(leadRes.data.leads);
        }
      } catch (e) {
        console.warn('Leads fetch error:', e);
      }

      // Fetch users
      try {
        const usersRes = await axios.get(`${API_BASE_URL}/api/auth/users`, {
          headers: getHeaders()
        });
        if (usersRes.data && usersRes.data.success) {
          setUsers(usersRes.data.users);
        }
      } catch (e) {
        console.warn('Users fetch error:', e);
      }

      // Fetch verification stats
      try {
        const verRes = await axios.get(`${API_BASE_URL}/api/verification/stats`, {
          headers: getHeaders()
        });
        if (verRes.data && verRes.data.success) {
          setVerificationStats(verRes.data.stats);
        }
      } catch (e) {
        console.warn('Verification stats fetch error:', e);
      }

    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to fetch admin dashboard records.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcelUpload = async (e) => {
    e.preventDefault();
    if (!excelFile) {
      setErrorMsg('Please select an Excel file to upload.');
      return;
    }
    setIsUploadingExcel(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('excelFile', excelFile);

      const res = await axios.post(`${API_BASE_URL}/api/verification/upload-excel`, formData, {
        headers: {
          ...getHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data && res.data.success) {
        setSuccessMsg(res.data.message || 'Excel verification codes imported successfully!');
        setExcelFile(null);
        fetchAdminData();
      } else {
        setErrorMsg(res.data.message || 'Failed to process Excel upload.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to upload Excel file.');
    } finally {
      setIsUploadingExcel(false);
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
      features: '', flavours: ['Kesar Badam', 'Cookies & Cream', 'Chocolate', 'Malai Kulfi'], details: '', badge: '', stock: '100',
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

    const defaultFlavours = prod.category === 'gainers'
      ? ['Malai Kulfi', 'Chocolate']
      : (prod.category === 'proteins' ? ['Kesar Badam', 'Cookies & Cream', 'Chocolate', 'Malai Kulfi'] : []);

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
      flavours: Array.isArray(prod.flavours) && prod.flavours.length > 0 ? prod.flavours : defaultFlavours,
      details: prod.details || '',
      badge: prod.badge || '',
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

  const compressImageFile = (file, maxWidth = 1400, quality = 0.82) => {
    return new Promise((resolve) => {
      if (!file || !file.type.startsWith('image/')) return resolve(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) return resolve(file);
              const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'product';
              const compressedFile = new File([blob], `${baseName}.webp`, {
                type: 'image/webp',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            },
            'image/webp',
            quality
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
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

      const origPrice = Number(productForm.originalPrice || 0);
      const parsedPrice = Number(productForm.price || 0);
      const discPrice = parsedPrice > 0 ? parsedPrice : (origPrice > 0 ? origPrice : 0);

      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('subtitle', productForm.subtitle);
      formData.append('category', productForm.category);
      formData.append('price', discPrice);
      formData.append('originalPrice', origPrice);
      formData.append('weight', productForm.weight);
      formData.append('servingSize', productForm.servingSize);
      formData.append('servingsCount', Number(productForm.servingsCount || 0));
      formData.append('protein', productForm.protein);
      formData.append('features', JSON.stringify(featuresArray));
      formData.append('flavours', JSON.stringify(productForm.flavours || []));
      formData.append('details', productForm.details);
      formData.append('badge', productForm.badge);
      formData.append('stock', Number(productForm.stock));
      formData.append('nutritionFacts', JSON.stringify(factsObj));

      if (selectedFiles && selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const compressed = await compressImageFile(file);
          formData.append('images', compressed);
        }
      } else if (editingProduct && editingProduct.images) {
        formData.append('images', JSON.stringify(editingProduct.images));
      }

      const url = editingProduct
        ? `${API_BASE_URL}/api/products/${editingProduct._id}`
        : `${API_BASE_URL}/api/products`;
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
  // Realized revenue: money actually collected/paid
  const netPaidRevenue = orders
    .filter(o => o.paymentStatus === 'paid' && o.orderStatus !== 'cancelled')
    .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  // Gross booking value: total order value of placed orders (excluding cancelled)
  const grossOrderValue = orders
    .filter(o => o.orderStatus !== 'cancelled')
    .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  // Pending collection (unpaid / COD orders pending delivery)
  const pendingCollection = orders
    .filter(o => o.paymentStatus !== 'paid' && o.orderStatus !== 'cancelled')
    .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  const outOfStockCount = products.filter(p => p.stock <= 0).length;

  // Reorder product functions
  const handleMoveProduct = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= filteredProducts.length) return;
    const updated = [...filteredProducts];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    const reorderedWithSeq = updated.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));
    setProducts(reorderedWithSeq);
    setProductSortOrder('custom');
  };

  const handleSaveProductOrder = async () => {
    setIsSavingOrder(true);
    try {
      // Use current displayed table order (filteredProducts)
      const listToSave = (filteredProducts && filteredProducts.length > 0) ? filteredProducts : products;
      const productOrders = listToSave.map((p, index) => ({
        id: p._id || p.id,
        displayOrder: index + 1
      }));

      const res = await axios.put(`${API_BASE_URL}/api/products/reorder`, { productOrders }, {
        headers: getHeaders()
      });

      if (res.data.success) {
        showSuccess('Product sequence saved successfully! Homepage updated.');
        const updatedProducts = listToSave.map((p, index) => ({
          ...p,
          displayOrder: index + 1
        }));
        setProducts(updatedProducts);
        setProductSortOrder('custom');
        fetchAdminData();
        if (onRefreshStoreProducts) onRefreshStoreProducts();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save product display sequence.');
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Filtered lists
  const filteredProducts = [...products]
    .filter(p =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
    )
    .sort((a, b) => {
      if (productSortOrder === 'custom') {
        const orderA = a.displayOrder !== undefined ? a.displayOrder : 9999;
        const orderB = b.displayOrder !== undefined ? b.displayOrder : 9999;
        if (orderA !== orderB) return orderA - orderB;
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
      if (productSortOrder === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (productSortOrder === 'price_desc') return (b.price || 0) - (a.price || 0);
      if (productSortOrder === 'name_asc') return a.name.localeCompare(b.name);

      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (dateA !== dateB) {
        return productSortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      }
      const idA = String(a._id || a.id || '');
      const idB = String(b._id || b.id || '');
      return productSortOrder === 'newest' ? idB.localeCompare(idA) : idA.localeCompare(idB);
    });

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
          <button className={`admin-tab-btn ${subTab === 'users' ? 'active' : ''}`} onClick={() => setSubTab('users')}>
            👥 CUSTOMER ACCOUNTS ({users.length})
          </button>
          <button className={`admin-tab-btn ${subTab === 'queries' ? 'active' : ''}`} onClick={() => setSubTab('queries')}>
            BUSINESS ENQUIRIES ({enquiries.length})
          </button>
          <button className={`admin-tab-btn ${subTab === 'offers' ? 'active' : ''}`} onClick={() => setSubTab('offers')}>
            PROMOTIONS & OFFERS ({offers.length})
          </button>
          <button className={`admin-tab-btn ${subTab === 'leads' ? 'active' : ''}`} onClick={() => setSubTab('leads')}>
            📱 POPUP LEADS ({leads.length})
          </button>
          <button className={`admin-tab-btn ${subTab === 'verification' ? 'active' : ''}`} onClick={() => setSubTab('verification')}>
            🛡️ CODES VERIFICATION ({verificationStats ? verificationStats.totalCount : 0})
          </button>
        </div>

        {/* ── SUB TAB: OVERVIEW ── */}
        {subTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.12)' }}>
                  <IndianRupee size={24} />
                </div>
                <div>
                  <span style={{ color: 'var(--text-gray)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Realized Revenue (Paid)</span>
                  <div className="admin-stat-val" style={{ color: '#22c55e' }}>₹{netPaidRevenue.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ color: 'var(--primary-yellow)', backgroundColor: 'rgba(255, 190, 0, 0.12)' }}>
                  <IndianRupee size={24} />
                </div>
                <div>
                  <span style={{ color: 'var(--text-gray)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Gross Order Booking</span>
                  <div className="admin-stat-val">₹{grossOrderValue.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ color: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.12)' }}>
                  <IndianRupee size={24} />
                </div>
                <div>
                  <span style={{ color: 'var(--text-gray)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Pending Collection (COD)</span>
                  <div className="admin-stat-val" style={{ color: '#f97316' }}>₹{pendingCollection.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.12)' }}>
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <span style={{ color: 'var(--text-gray)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Total Orders</span>
                  <div className="admin-stat-val">{orders.length}</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ color: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.12)' }}>
                  <Box size={24} />
                </div>
                <div>
                  <span style={{ color: 'var(--text-gray)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Active Catalog Items</span>
                  <div className="admin-stat-val">{products.length}</div>
                </div>
              </div>

              <div className="admin-stat-card" style={{ cursor: 'pointer' }} onClick={() => setSubTab('leads')}>
                <div className="admin-stat-icon" style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.12)' }}>
                  <User size={24} />
                </div>
                <div>
                  <span style={{ color: 'var(--text-gray)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Captured Popup Leads</span>
                  <div className="admin-stat-val" style={{ color: '#10b981' }}>{leads.length}</div>
                </div>
              </div>

              <div className="admin-stat-card" style={{ border: outOfStockCount > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--bg-dark-600)' }}>
                <div className="admin-stat-icon" style={{
                  color: outOfStockCount > 0 ? '#ef4444' : 'var(--text-gray)',
                  backgroundColor: outOfStockCount > 0 ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-dark-700)'
                }}>
                  <AlertCircle size={24} />
                </div>
                <div>
                  <span style={{ color: 'var(--text-gray)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Out of Stock Warnings</span>
                  <div className="admin-stat-val" style={{ color: outOfStockCount > 0 ? '#ef4444' : 'inherit' }}>{outOfStockCount}</div>
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
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px', flex: 1, maxWidth: '780px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ flex: 1, minWidth: '200px', backgroundColor: 'var(--bg-dark-800)', border: '1px solid var(--bg-dark-600)' }}>
                  <input
                    type="text"
                    placeholder="Search by name or category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--text-gray)', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Order By:</span>
                  <select
                    value={productSortOrder}
                    onChange={(e) => setProductSortOrder(e.target.value)}
                    style={{
                      backgroundColor: 'var(--bg-dark-800)',
                      color: 'var(--primary-yellow)',
                      border: '1px solid var(--bg-dark-600)',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="custom">🎯 Custom Homepage Sequence</option>
                    <option value="newest">✨ Newest First</option>
                    <option value="oldest">⏳ Oldest First</option>
                    <option value="price_asc">💵 Price: Low to High</option>
                    <option value="price_desc">💎 Price: High to Low</option>
                    <option value="name_asc">🔤 Name: A to Z</option>
                  </select>
                </div>

                <button
                  className="btn btn-secondary"
                  onClick={handleSaveProductOrder}
                  disabled={isSavingOrder}
                  style={{
                    display: 'flex',
                    gap: '6px',
                    alignItems: 'center',
                    backgroundColor: 'var(--primary-yellow)',
                    color: '#000',
                    fontWeight: '900',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isSavingOrder ? 'not-allowed' : 'pointer'
                  }}
                  title="Save current product sequence to reflect on Homepage"
                >
                  <Save size={16} />
                  {isSavingOrder ? 'Saving...' : 'Save Order to Homepage'}
                </button>
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
                      <th style={{ width: '60px', textAlign: 'center' }}>Pos</th>
                      <th style={{ width: '90px', textAlign: 'center' }}>Arrange</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Selling Price</th>
                      <th>Original Price (MRP)</th>
                      <th>Discount</th>
                      <th>Stock Quantity</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p, idx) => {
                      const actualIdx = products.findIndex(prod => (prod._id || prod.id) === (p._id || p.id));
                      const effectiveSellingPrice = (p.price && p.price > 0) ? p.price : (p.originalPrice || 0);
                      const hasDiscount = p.originalPrice && p.originalPrice > effectiveSellingPrice;
                      const discountPct = hasDiscount ? Math.round(((p.originalPrice - effectiveSellingPrice) / p.originalPrice) * 100) : 0;

                      return (
                        <tr
                          key={p._id || p.id || idx}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', actualIdx);
                            setDraggedTableProductIndex(actualIdx);
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                            if (!isNaN(fromIdx) && fromIdx !== actualIdx) {
                              handleMoveProduct(fromIdx, actualIdx);
                            }
                            setDraggedTableProductIndex(null);
                          }}
                          style={{
                            opacity: draggedTableProductIndex === actualIdx ? 0.4 : 1,
                            backgroundColor: draggedTableProductIndex === actualIdx ? 'rgba(255, 184, 0, 0.1)' : 'transparent',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <td style={{ textAlign: 'center' }}>
                            <span
                              style={{
                                background: 'var(--bg-dark-700)',
                                color: 'var(--primary-yellow)',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '0.78rem',
                                fontWeight: 900,
                                border: '1px solid rgba(255, 184, 0, 0.2)'
                              }}
                            >
                              #{actualIdx + 1}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                              <GripVertical size={16} color="var(--text-muted)" style={{ cursor: 'grab', marginRight: '4px' }} title="Drag to reorder" />
                              <button
                                className="btn-icon"
                                disabled={actualIdx === 0}
                                onClick={() => handleMoveProduct(actualIdx, actualIdx - 1)}
                                style={{ opacity: actualIdx === 0 ? 0.3 : 1, padding: '4px' }}
                                title="Move product up"
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                className="btn-icon"
                                disabled={actualIdx === products.length - 1}
                                onClick={() => handleMoveProduct(actualIdx, actualIdx + 1)}
                                style={{ opacity: actualIdx === products.length - 1 ? 0.3 : 1, padding: '4px' }}
                                title="Move product down"
                              >
                                <ArrowDown size={14} />
                              </button>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: '800' }}>{p.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.subtitle}</div>
                          </td>
                          <td style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold' }}>{p.category}</td>
                          <td style={{ fontWeight: '900', color: '#16a34a', fontSize: '0.92rem' }}>
                            ₹{effectiveSellingPrice.toLocaleString('en-IN')}
                          </td>
                          <td style={{ textDecoration: hasDiscount ? 'line-through' : 'none', color: 'var(--text-muted)' }}>
                            {p.originalPrice ? `₹${p.originalPrice.toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td>
                            {hasDiscount ? (
                              <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                🔥 {discountPct}% OFF
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No Discount</span>
                            )}
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
                      );
                    })}
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
                  setEditingOffer(null);
                  setOfferForm({
                    title: '', description: '', code: '', discountType: 'percentage', discountValue: '',
                    customerType: 'online', image: '',
                    startDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
                    targetProducts: []
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
                      <th>Target Audience</th>
                      <th>Discount Details</th>
                      <th>Duration Validity</th>
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {off.image && (
                                <img src={off.image} alt={off.title} style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--bg-dark-600)', flexShrink: 0 }} />
                              )}
                              <div>
                                <strong style={{ fontSize: '0.85rem', display: 'block' }}>{off.title}</strong>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{off.description}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                background: off.customerType === 'offline' ? 'rgba(148, 163, 184, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                                color: off.customerType === 'offline' ? '#94a3b8' : '#22c55e',
                                border: `1px solid ${off.customerType === 'offline' ? 'rgba(148, 163, 184, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`
                              }}
                            >
                              {off.customerType === 'offline' ? '🔒 Offline (Private)' : '🌐 Online (Public)'}
                            </span>
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
                                className="btn-icon"
                                style={{ color: 'var(--primary-yellow)' }}
                                onClick={() => handleOpenEditOffer(off)}
                                title="Edit Promotion Coupon"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                                onClick={async () => {
                                  try {
                                    await axios.put(`${API_BASE_URL}/api/offers/${off._id}`, { isActive: !off.isActive }, { headers: getHeaders() });
                                    showSuccess('Offer status updated.');
                                    fetchAdminData();
                                    if (onRefreshStoreProducts) onRefreshStoreProducts();
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
                                    if (onRefreshStoreProducts) onRefreshStoreProducts();
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
        {/* ── SUB TAB: POPUP LEADS ── */}
        {subTab === 'leads' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ textTransform: 'uppercase', fontWeight: 900, margin: 0 }}>
                  📱 Captured VIP Popup Leads ({leads.length})
                </h3>
                <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  Mobile numbers submitted via the VIP Welcome Popup coupon form.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search phone number..."
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--bg-dark-600)',
                    backgroundColor: 'var(--bg-dark-700)',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                />
                <button
                  className="btn btn-secondary"
                  style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.8rem' }}
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8,"
                      + ["Phone Number,Source,Coupon Code,Status,Captured Date"].join(",") + "\n"
                      + leads.map(l => `"${l.phone}","${l.source}","${l.couponCode}","${l.status}","${new Date(l.createdAt).toLocaleString()}"`).join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `elmen_popup_leads_${new Date().toISOString().slice(0,10)}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  📥 Export CSV
                </button>
              </div>
            </div>

            {leads.length === 0 ? (
              <p style={{ color: 'var(--text-gray)', textAlign: 'center', padding: '40px' }}>No popup leads captured yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mobile Number</th>
                      <th>Source / Offer</th>
                      <th>Captured Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads
                      .filter(l => l.phone.includes(leadSearch))
                      .map((lead) => (
                        <tr key={lead._id}>
                          <td style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--primary-yellow)' }}>
                            <a
                              href={`https://wa.me/91${lead.phone}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: 'var(--primary-yellow)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              💬 +91 {lead.phone}
                            </a>
                          </td>
                          <td>
                            <span className="admin-badge" style={{ backgroundColor: 'rgba(255, 190, 0, 0.1)', color: 'var(--primary-yellow)' }}>
                              {lead.couponCode || 'WELCOME10'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>
                            {new Date(lead.createdAt).toLocaleString()}
                          </td>
                          <td>
                            <select
                              value={lead.status || 'new'}
                              onChange={async (e) => {
                                try {
                                  await axios.put(`${API_BASE_URL}/api/leads/${lead._id}`, { status: e.target.value }, { headers: getHeaders() });
                                  setSuccessMsg('Lead status updated.');
                                  setTimeout(() => setSuccessMsg(''), 3000);
                                  fetchAdminData();
                                } catch (err) {
                                  setErrorMsg('Failed to update lead status.');
                                }
                              }}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                backgroundColor: 'var(--bg-dark-700)',
                                color: lead.status === 'converted' ? '#27ae60' : lead.status === 'contacted' ? '#e65100' : '#fff',
                                border: '1px solid var(--bg-dark-600)',
                                fontSize: '0.78rem',
                                fontWeight: 'bold'
                              }}
                            >
                              <option value="new">🆕 New</option>
                              <option value="contacted">📞 Contacted</option>
                              <option value="converted">✅ Converted</option>
                              <option value="archived">📁 Archived</option>
                            </select>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <a
                                className="btn btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.75rem', textDecoration: 'none' }}
                                href={`https://wa.me/91${lead.phone}?text=Hi%2C%20this%20is%20EL%20MEN%20Nutrition!`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                WhatsApp
                              </a>
                              <button
                                className="btn-icon"
                                style={{ color: 'var(--primary-red)' }}
                                onClick={async () => {
                                  if (!window.confirm(`Delete lead +91 ${lead.phone}?`)) return;
                                  try {
                                    await axios.delete(`${API_BASE_URL}/api/leads/${lead._id}`, { headers: getHeaders() });
                                    setSuccessMsg('Lead deleted.');
                                    setTimeout(() => setSuccessMsg(''), 3000);
                                    fetchAdminData();
                                  } catch (err) {
                                    setErrorMsg('Failed to delete lead.');
                                  }
                                }}
                              >
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

        {/* ── SUB TAB: PRODUCT VERIFICATION CODES ── */}
        {subTab === 'verification' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ textTransform: 'uppercase', fontWeight: 900, margin: 0 }}>
                  🛡️ Security Scratch Codes & Serial Numbers
                </h3>
                <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', marginTop: '4px' }}>
                  Upload Excel files containing <code style={{ color: 'var(--primary-yellow)' }}>SerialNum</code> and <code style={{ color: 'var(--primary-yellow)' }}>Code</code> columns to populate backend authentication database.
                </p>
              </div>
            </div>

            {/* Verification Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div className="admin-stat-card">
                <div>
                  <span style={{ color: 'var(--text-gray)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Total Codes in Database</span>
                  <div className="admin-stat-val">{verificationStats ? verificationStats.totalCount : 0}</div>
                </div>
              </div>
              <div className="admin-stat-card">
                <div>
                  <span style={{ color: '#27ae60', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Claimed / Verified Codes</span>
                  <div className="admin-stat-val" style={{ color: '#27ae60' }}>{verificationStats ? verificationStats.verifiedCount : 0}</div>
                </div>
              </div>
              <div className="admin-stat-card">
                <div>
                  <span style={{ color: 'var(--primary-yellow)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Available Unverified</span>
                  <div className="admin-stat-val" style={{ color: 'var(--primary-yellow)' }}>{verificationStats ? verificationStats.unverifiedCount : 0}</div>
                </div>
              </div>
            </div>

            {/* Excel Upload Card */}
            <div style={{ background: 'var(--bg-dark-800)', border: '1px solid var(--bg-dark-600)', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
              <h4 style={{ textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px' }}>📥 Import Codes from Excel (.xlsx / .csv)</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '16px' }}>
                Select an Excel spreadsheet containing serial numbers and scratch codes. Columns named <strong>SerialNum</strong> and <strong>Code</strong> will be automatically mapped into MongoDB.
              </p>

              <form onSubmit={handleExcelUpload} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => setExcelFile(e.target.files[0] || null)}
                  style={{
                    padding: '10px 14px',
                    background: 'var(--bg-dark-700)',
                    border: '1px solid var(--bg-dark-600)',
                    borderRadius: '8px',
                    color: 'var(--text-white)',
                    fontSize: '0.85rem'
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUploadingExcel || !excelFile}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  {isUploadingExcel ? 'Uploading & Processing...' : 'Upload & Import Excel Codes'}
                </button>
              </form>
            </div>

            {/* Recent Verifications Table */}
            {verificationStats && verificationStats.recentVerifications && verificationStats.recentVerifications.length > 0 && (
              <div>
                <h4 style={{ textTransform: 'uppercase', fontWeight: 800, marginBottom: '14px' }}>📋 Recent Authenticated Claims</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Serial Number</th>
                        <th>Security Code</th>
                        <th>Verified Date</th>
                        <th>Client IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verificationStats.recentVerifications.map(v => (
                        <tr key={v._id}>
                          <td><strong>#{v.serialNum}</strong></td>
                          <td><code>{v.code}</code></td>
                          <td>{new Date(v.verifiedAt).toLocaleString('en-IN')}</td>
                          <td><small>{v.verifiedByIp || 'Local'}</small></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SUB TAB: CUSTOMER ACCOUNTS ── */}
        {subTab === 'users' && (
          <div>
            {/* Header & Search Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ textTransform: 'uppercase', fontWeight: 900, margin: 0 }}>
                  👥 Registered Customer Accounts ({users.length})
                </h3>
                <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', marginTop: '4px', margin: 0 }}>
                  Manage customer profiles, saved delivery addresses, and account registration details.
                </p>
              </div>

              <div style={{ position: 'relative', width: '320px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search name, email, phone, city..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ paddingLeft: '36px', height: '40px', fontSize: '0.85rem' }}
                />
                <Filter size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              </div>
            </div>

            {/* Users Table */}
            {users.length === 0 ? (
              <p style={{ color: 'var(--text-gray)', textAlign: 'center', padding: '40px' }}>No registered user accounts found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Customer Profile</th>
                      <th>Phone</th>
                      <th>Saved Address</th>
                      <th>Orders Placed</th>
                      <th>Account Role</th>
                      <th>Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(u => {
                        const q = userSearch.toLowerCase().trim();
                        if (!q) return true;
                        const nameMatch = (u.name || '').toLowerCase().includes(q);
                        const emailMatch = (u.email || '').toLowerCase().includes(q);
                        const phoneMatch = (u.phone || '').toLowerCase().includes(q);
                        const cityMatch = (u.address?.city || '').toLowerCase().includes(q);
                        return nameMatch || emailMatch || phoneMatch || cityMatch;
                      })
                      .map(u => {
                        const userOrderCount = orders.filter(o => {
                          const oUserId = typeof o.user === 'object' ? o.user?._id : o.user;
                          return String(oUserId) === String(u._id);
                        }).length;

                        const initial = (u.name || u.email || 'U').charAt(0).toUpperCase();

                        return (
                          <tr key={u._id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                  width: '38px', height: '38px', borderRadius: '50%',
                                  background: u.role === 'admin' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                  color: '#fff', fontWeight: 900, fontSize: '1rem',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                  {initial}
                                </div>
                                <div>
                                  <strong style={{ fontSize: '0.9rem', display: 'block', color: '#fff' }}>{u.name}</strong>
                                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</span>
                                </div>
                              </div>
                            </td>
                            <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                              {u.phone ? u.phone : <span style={{ color: 'var(--text-muted)' }}>Not provided</span>}
                            </td>
                            <td style={{ fontSize: '0.78rem', maxWidth: '240px' }}>
                              {u.address && (u.address.street || u.address.city) ? (
                                <div>
                                  <div>{u.address.street}</div>
                                  <div style={{ color: 'var(--text-muted)' }}>
                                    {[u.address.city, u.address.state, u.address.pincode].filter(Boolean).join(', ')}
                                  </div>
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-muted)' }}>No saved address</span>
                              )}
                            </td>
                            <td>
                              <span style={{
                                padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 900,
                                background: userOrderCount > 0 ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-dark-700)',
                                color: userOrderCount > 0 ? '#22c55e' : 'var(--text-muted)'
                              }}>
                                {userOrderCount} Order{userOrderCount === 1 ? '' : 's'}
                              </span>
                            </td>
                            <td>
                              <span style={{
                                padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase',
                                background: u.role === 'admin' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.15)',
                                color: u.role === 'admin' ? 'var(--primary-yellow)' : '#60a5fa',
                                border: `1px solid ${u.role === 'admin' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(59, 130, 246, 0.3)'}`
                              }}>
                                {u.role === 'admin' ? '👑 Admin' : '👤 Customer'}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
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
                  <label>Original MRP Price (INR ₹) *</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    placeholder="e.g. 1299"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Discounted Price (INR ₹) <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>(Optional)</span></label>
                  <input
                    type="number"
                    className="form-input"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="e.g. 999 (Leave blank if no discount)"
                    min="0"
                  />
                </div>
              </div>

              {/* Row 4: Specs - Dynamic per category */}
              {productForm.category === 'accessories' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Weight / GSM</label>
                    <input
                      type="text"
                      className="form-input"
                      value={productForm.weight}
                      onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                      placeholder="e.g. 620 GSM / 350g"
                    />
                  </div>
                  <div className="form-group">
                    <label>Dimensions / Size</label>
                    <input
                      type="text"
                      className="form-input"
                      value={productForm.servingSize}
                      onChange={(e) => setProductForm({ ...productForm, servingSize: e.target.value })}
                      placeholder="e.g. 40cm x 60cm or Free Size"
                    />
                  </div>
                </div>
              ) : (
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
              )}

              {/* Row 5: Protein (Supplements only) and Promo Badge */}
              <div style={{ display: 'grid', gridTemplateColumns: productForm.category === 'accessories' ? '1fr' : '1fr 1fr', gap: '16px' }}>
                {productForm.category !== 'accessories' && (
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
                )}
                <div className="form-group">
                  <label>Promo Badge Text</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    placeholder="e.g. Best Seller / Premium Cotton"
                  />
                </div>
              </div>

              {/* Product Flavours / Colors Selection */}
              <div className="form-group" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <label style={{ display: 'block', fontWeight: 800, color: '#0f172a', marginBottom: '4px', fontSize: '0.88rem' }}>
                  {productForm.category === 'accessories' ? 'AVAILABLE PRODUCT COLORS / VARIANTS' : 'AVAILABLE PRODUCT FLAVOURS'}
                </label>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0' }}>
                  {productForm.category === 'accessories'
                    ? 'Click badges to toggle available colors or edit colors below (separated by commas).'
                    : 'Click badges to toggle available flavours or edit flavours below (separated by commas).'}
                </p>

                {/* Category Preset Flavour / Color Quick Toggles */}
                {(() => {
                  const categoryPresets = {
                    gainers: ['Malai Kulfi', 'Chocolate'],
                    proteins: ['Kesar Badam', 'Cookies & Cream', 'Chocolate', 'Malai Kulfi'],
                    accessories: ['Navy Blue', 'Black', 'Grey', 'White', 'BlueBlack', 'Free Size']
                  };
                  const activeCategoryOptions = categoryPresets[productForm.category] || ['Navy Blue', 'Black', 'Grey', 'White'];

                  return (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {activeCategoryOptions.map((opt) => {
                        const currentList = Array.isArray(productForm.flavours) ? productForm.flavours : [];
                        const isSelected = currentList.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              const next = isSelected ? currentList.filter(f => f !== opt) : [...currentList, opt];
                              setProductForm({ ...productForm, flavours: next });
                            }}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: 800,
                              border: isSelected ? '1.5px solid #d97706' : '1px solid #cbd5e1',
                              backgroundColor: isSelected ? '#fffbeb' : '#ffffff',
                              color: isSelected ? '#b45309' : '#475569',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {isSelected ? '✓ ' : '+ '} {opt}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Custom Flavours / Colors Input */}
                <input
                  type="text"
                  className="form-input"
                  value={Array.isArray(productForm.flavours) ? productForm.flavours.join(', ') : (productForm.flavours || '')}
                  onChange={(e) => {
                    const val = e.target.value;
                    const parsed = val.split(',').map(s => s.trim()).filter(Boolean);
                    setProductForm({ ...productForm, flavours: parsed });
                  }}
                  placeholder={productForm.category === 'accessories' ? 'e.g. Navy Blue, Black, Grey, White' : 'e.g. Kesar Badam, Cookies & Cream, Chocolate'}
                  style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                />
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

              {/* Product Specifications / Supplement Facts key values */}
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '10px' }}>
                  {productForm.category === 'accessories' ? 'Product Specifications (Details / Features)' : 'Supplement Facts (Nutrition values)'}
                </label>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {productForm.nutritionFactsInput.map((fact, index) => (
                    <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder={productForm.category === 'accessories' ? 'Feature (e.g. GSM / Material)' : 'Nutrient (e.g. BCAAs)'}
                        className="form-input"
                        value={fact.key}
                        onChange={(e) => handleNutritionFactChange(index, 'key', e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <input
                        type="text"
                        placeholder={productForm.category === 'accessories' ? 'Value (e.g. 620 GSM / 100% Cotton)' : 'Amount (e.g. 5.5g)'}
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
              {editingOffer ? '✏️ Edit Promotion Coupon' : '🏷️ Create Promotion Coupon'}
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
                    customerType: offerForm.customerType || 'online',
                    image: offerForm.image || '',
                    startDate: offerForm.startDate,
                    endDate: offerForm.endDate,
                    targetProducts: offerForm.targetProducts
                  };

                  if (editingOffer) {
                    await axios.put(`${API_BASE_URL}/api/offers/${editingOffer._id}/details`, body, { headers: getHeaders() });
                    showSuccess('Promotion Coupon updated successfully!');
                  } else {
                    await axios.post(`${API_BASE_URL}/api/offers`, body, { headers: getHeaders() });
                    showSuccess('Promotion Coupon created successfully!');
                  }
                  setIsOfferModalOpen(false);
                  setEditingOffer(null);
                  fetchAdminData();
                  if (onRefreshStoreProducts) onRefreshStoreProducts();
                } catch (err) {
                  setErrorMsg(err.response?.data?.message || err.message || 'Failed to save offer.');
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
                <label>Offer Promotional Banner / Image (Optional)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-input"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setOfferForm(prev => ({ ...prev, image: reader.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>- OR paste image web URL below -</span>
                  <input
                    type="text"
                    className="form-input"
                    value={offerForm.image}
                    onChange={(e) => setOfferForm({ ...offerForm, image: e.target.value })}
                    placeholder="e.g. https://images.unsplash.com/photo-..."
                  />
                  {offerForm.image && (
                    <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '12px', overflow: 'hidden', border: '1.5px solid var(--primary-yellow)', marginTop: '4px' }}>
                      <img src={offerForm.image} alt="Offer Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setOfferForm({ ...offerForm, image: '' })}
                        style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                        title="Remove Image"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Target Customer / Coupon Visibility *</label>
                <select
                  className="form-input"
                  value={offerForm.customerType || 'online'}
                  onChange={(e) => setOfferForm({ ...offerForm, customerType: e.target.value })}
                >
                  <option value="online">🌐 Online Customer (Listed on Offers Section & Storefront Ticker)</option>
                  <option value="offline">🔒 Offline / In-Store Customer (Private Coupon - Hidden from Storefront)</option>
                </select>
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
                  {isLoading ? 'Saving Promotion...' : editingOffer ? 'Save Changes' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
