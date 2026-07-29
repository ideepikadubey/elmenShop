import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "../config/api";
import { X, CreditCard, QrCode, Truck, Check, HelpCircle, FileText } from 'lucide-react';

export default function CheckoutModal({ cartItems, priceDetails, onClose, onClearCart, user }) {
  const [formData, setFormData] = useState({
    name: user ? user.name : '',
    email: user ? user.email : '',
    phone: user ? user.phone : '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name,
        email: prev.email || user.email,
        phone: prev.phone || user.phone,
      }));
    }
  }, [user]);

  const [paymentMethod, setPaymentMethod] = useState('online'); // online, cod
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [errors, setErrors] = useState({});

  const formatPrice = (amount) => {
    return amount.toLocaleString('en-IN');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Enter a valid 10-digit number';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Enter a valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);
    setErrors({});

    try {
      const token = localStorage.getItem('elmen_token');
      if (!token) {
        throw new Error('You are not logged in. Please log in to complete your purchase.');
      }

      const orderItems = cartItems.map(item => ({
        productId: item._id || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        flavour: item.selectedFlavour || item.flavour || '',
        image: item.image || ''
      }));

      const shippingAddress = {
        fullName: formData.name,
        phone: formData.phone,
        email: formData.email,
        street: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: 'India'
      };

      const response = await axios.post(`${API_BASE_URL}/api/orders`, {
        items: orderItems,
        shippingAddress,
        paymentMethod: paymentMethod === 'cod' ? 'cod' : 'razorpay',
        couponCode: priceDetails?.appliedPromo?.code || ''
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = response.data;

      if (paymentMethod === 'cod') {
        setOrderId(data.order._id);
        setIsSuccess(true);
        setIsProcessing(false);
        onClearCart();
        return;
      }

      const paymentRes = await axios.post(`${API_BASE_URL}/api/payments/create-order`, {
        orderId: data.order._id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const paymentData = paymentRes.data;
      if (!paymentData.success) {
        throw new Error(paymentData.message || 'Failed to initialize payment.');
      }

      if (paymentData.mock) {
        await axios.post(`${API_BASE_URL}/api/payments/verify`, {
          orderId: data.order._id,
          razorpayOrderId: paymentData.razorpayOrderId,
          razorpayPaymentId: 'mock_payment_id',
          razorpaySignature: 'mock_signature'
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setOrderId(data.order._id);
        setIsSuccess(true);
        setIsProcessing(false);
        onClearCart();
        return;
      }

      const options = {
        key: paymentData.keyId,
        amount: paymentData.amount,
        currency: 'INR',
        name: 'EL MEN Nutrition',
        description: 'Workout Supplements Checkout',
        order_id: paymentData.razorpayOrderId,
        handler: async function (response) {
          try {
            setIsProcessing(true);
            const verifyRes = await axios.post(`${API_BASE_URL}/api/payments/verify`, {
              orderId: data.order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            }, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (verifyRes.data.success) {
              setOrderId(data.order._id);
              setIsSuccess(true);
              onClearCart();
            } else {
              throw new Error('Payment verification failed.');
            }
          } catch (err) {
            setErrors({ submit: err.response?.data?.message || err.message || 'Verification failed.' });
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#fbbf24'
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      setErrors({ submit: err.response?.data?.message || err.message || 'Checkout failed.' });
      setIsProcessing(false);
    }
  };

  const handleFinish = () => {
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <div
        className="modal-content animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '850px',
          padding: '32px',
          borderRadius: '24px',
          background: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 30px 60px rgba(15, 23, 42, 0.15)',
          color: '#1e293b',
          fontFamily: '"Outfit", "Inter", sans-serif',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div className="modal-close-wrapper" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9', border: 'none', borderRadius: '50%',
              width: '36px', height: '36px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: '#475569',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: 0 }}>
          {isProcessing ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '20px' }}>
              <div className="loading-spinner" style={{ width: '45px', height: '45px', borderLeftColor: '#fbbf24', borderTopWidth: '3px', borderWidth: '3px', animation: 'spin 0.8s linear infinite' }} />
              <h3 style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 900, color: '#0f172a' }}>Securing Transaction</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Please do not close this window or refresh the page...</p>
            </div>
          ) : isSuccess ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.12)',
                marginBottom: '20px'
              }}>
                <Check size={40} style={{ color: '#22c55e' }} />
              </div>
              <h2 style={{ textTransform: 'uppercase', fontWeight: 900, marginBottom: '8px', color: '#0f172a', letterSpacing: '-0.5px' }}>
                Order Placed Successfully!
              </h2>
              <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '0.95rem', maxWidth: '480px', lineHeight: '1.5', fontWeight: 500 }}>
                Your order is confirmed. A receipt and shipment tracking details will be sent to <strong style={{ color: '#0f172a' }}>{formData.email}</strong>.
              </p>

              <div style={{
                width: '100%', maxWidth: '500px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '32px', textAlign: 'left',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.01)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '14px' }}>
                  <div>
                    <h4 style={{ fontWeight: 900, fontSize: '1rem', color: '#0f172a', margin: 0 }}>EL MEN NUTRITION</h4>
                    <span style={{ fontSize: '0.65rem', color: '#d97706', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Receipt Summary</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Order ID: #{orderId.slice(-8).toUpperCase()}</p>
                    <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '2px 0 0' }}>{new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                  </div>
                </div>

                <div style={{ marginBottom: '16px', fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <p style={{ margin: 0 }}><strong>Deliver To:</strong></p>
                  <p style={{ margin: 0, color: '#0f172a', fontWeight: 600 }}>{formData.name}</p>
                  <p style={{ margin: 0 }}>{formData.address}, {formData.city} - {formData.pincode}</p>
                  <p style={{ margin: 0 }}>Phone: {formData.phone}</p>
                </div>

                <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '12px' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>Items Purchased:</p>
                  {cartItems.map((item, idx) => (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '8px' }} key={`${item.id || item._id}-${idx}`}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{item.name} <strong style={{ color: '#0f172a' }}>× {item.quantity}</strong></span>
                        {(item.selectedFlavour || item.flavour) && (
                          <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 800 }}>
                            Flavour: {item.selectedFlavour || item.flavour}
                          </span>
                        )}
                      </div>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
                  <span>Subtotal</span>
                  <span>₹{formatPrice(priceDetails.subtotal)}</span>
                </div>
                {priceDetails.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#22c55e', marginBottom: '6px', fontWeight: 600 }}>
                    <span>Discount Applied</span>
                    <span>-₹{formatPrice(priceDetails.discountAmount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '8px' }}>
                  <span>Delivery Charges</span>
                  <span>{priceDetails.deliveryCharges === 0 ? 'FREE' : `₹${formatPrice(priceDetails.deliveryCharges)}`}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 900, color: '#d97706', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                  <span>Paid Total</span>
                  <span>₹{formatPrice(priceDetails.finalTotal)}/-</span>
                </div>

                <p style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center', marginTop: '20px', fontStyle: 'italic', margin: '20px 0 0 0' }}>
                  Paid via: {paymentMethod === 'online' ? 'Online Payment (Razorpay Secure)' : 'Cash on Delivery'}
                </p>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleFinish}
                style={{
                  padding: '12px 36px', borderRadius: '30px', fontWeight: 800, textTransform: 'uppercase',
                  boxShadow: '0 4px 10px rgba(234, 179, 8, 0.2)', border: 'none', cursor: 'pointer', backgroundColor: '#eab308', color: '#0f172a'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ca8a04'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#eab308'}
              >
                Done & Return to Store
              </button>
            </div>
          ) : (
            <div>
              <h2 style={{ textTransform: 'uppercase', fontWeight: 900, marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', fontSize: '1.5rem', color: '#0f172a', letterSpacing: '-0.5px' }}>
                Secure Checkout
              </h2>

              <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>

                {/* Shipping Info Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '4px', color: '#d97706', fontWeight: 800, letterSpacing: '0.5px' }}>
                    Shipping Information
                  </h3>

                  <div className="form-group">
                    <label style={{ color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      style={{ height: '44px', padding: '0 16px', background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#0f172a', outline: 'none', borderRadius: '10px', width: '100%', fontSize: '0.9rem', fontWeight: 500 }}
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                    {errors.name && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500, display: 'block', marginTop: '4px' }}>{errors.name}</span>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label style={{ color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        className="form-input"
                        style={{ height: '44px', padding: '0 16px', background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#0f172a', outline: 'none', borderRadius: '10px', width: '100%', fontSize: '0.9rem', fontWeight: 500 }}
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                      {errors.email && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500, display: 'block', marginTop: '4px' }}>{errors.email}</span>}
                    </div>
                    <div className="form-group">
                      <label style={{ color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        className="form-input"
                        style={{ height: '44px', padding: '0 16px', background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#0f172a', outline: 'none', borderRadius: '10px', width: '100%', fontSize: '0.9rem', fontWeight: 500 }}
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                      {errors.phone && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500, display: 'block', marginTop: '4px' }}>{errors.phone}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Street Address</label>
                    <input
                      type="text"
                      name="address"
                      className="form-input"
                      style={{ height: '44px', padding: '0 16px', background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#0f172a', outline: 'none', borderRadius: '10px', width: '100%', fontSize: '0.9rem', fontWeight: 500 }}
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                    {errors.address && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500, display: 'block', marginTop: '4px' }}>{errors.address}</span>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label style={{ color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>City</label>
                      <input
                        type="text"
                        name="city"
                        className="form-input"
                        style={{ height: '44px', padding: '0 16px', background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#0f172a', outline: 'none', borderRadius: '10px', width: '100%', fontSize: '0.9rem', fontWeight: 500 }}
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                      {errors.city && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500, display: 'block', marginTop: '4px' }}>{errors.city}</span>}
                    </div>
                    <div className="form-group">
                      <label style={{ color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>State</label>
                      <input
                        type="text"
                        name="state"
                        className="form-input"
                        style={{ height: '44px', padding: '0 16px', background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#0f172a', outline: 'none', borderRadius: '10px', width: '100%', fontSize: '0.9rem', fontWeight: 500 }}
                        value={formData.state}
                        placeholder="e.g. Maharashtra"
                        onChange={handleInputChange}
                      />
                      {errors.state && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500, display: 'block', marginTop: '4px' }}>{errors.state}</span>}
                    </div>
                    <div className="form-group">
                      <label style={{ color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Pincode</label>
                      <input
                        type="text"
                        name="pincode"
                        className="form-input"
                        style={{ height: '44px', padding: '0 16px', background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#0f172a', outline: 'none', borderRadius: '10px', width: '100%', fontSize: '0.9rem', fontWeight: 500 }}
                        value={formData.pincode}
                        onChange={handleInputChange}
                      />
                      {errors.pincode && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500, display: 'block', marginTop: '4px' }}>{errors.pincode}</span>}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', margin: '24px 0 4px', color: '#d97706', fontWeight: 800, letterSpacing: '0.5px' }}>
                    Payment Options
                  </h3>

                  <div className="payment-options" style={{ display: 'flex', gap: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('online')}
                      style={{
                        flex: 1, height: '64px', borderRadius: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s',
                        background: paymentMethod === 'online' ? '#fffbeb' : '#f8fafc',
                        border: paymentMethod === 'online' ? '2.5px solid #eab308' : '1.5px solid #cbd5e1',
                        color: paymentMethod === 'online' ? '#b45309' : '#475569',
                        fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase'
                      }}
                    >
                      <CreditCard size={20} />
                      <span>Pay Online</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      style={{
                        flex: 1, height: '64px', borderRadius: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s',
                        background: paymentMethod === 'cod' ? '#fffbeb' : '#f8fafc',
                        border: paymentMethod === 'cod' ? '2.5px solid #eab308' : '1.5px solid #cbd5e1',
                        color: paymentMethod === 'cod' ? '#b45309' : '#475569',
                        fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase'
                      }}
                    >
                      <Truck size={20} />
                      <span>COD</span>
                    </button>
                  </div>

                  {paymentMethod === 'online' && (
                    <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', marginTop: '8px' }}>
                      <p style={{ color: '#0f172a', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>
                        Secured Checkout via Razorpay
                      </p>
                      <p style={{ color: '#475569', fontSize: '0.8rem', lineHeight: '1.5', margin: 0 }}>
                        Supports all major credit/debit cards, Net Banking, instant UPI transfers, and mobile wallets.
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'cod' && (
                    <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', marginTop: '8px' }}>
                      <p style={{ color: '#475569', fontSize: '0.8rem', lineHeight: '1.5', margin: 0 }}>
                        Please pay the exact amount of <strong>₹{formatPrice(priceDetails.finalTotal)}</strong> in cash at the time of delivery.
                      </p>
                    </div>
                  )}

                  {errors.submit && (
                    <div style={{ color: '#991b1b', fontSize: '0.85rem', textAlign: 'center', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '12px', border: '1px solid #fecaca', marginTop: '8px', fontWeight: 500 }}>
                      {errors.submit}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      width: '100%', padding: '14px 20px', borderRadius: '30px', fontWeight: 800, textTransform: 'uppercase',
                      boxShadow: '0 4px 10px rgba(234, 179, 8, 0.2)', border: 'none', cursor: 'pointer', backgroundColor: '#eab308', color: '#0f172a',
                      marginTop: '16px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ca8a04'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#eab308'}
                  >
                    Confirm & Complete Order
                  </button>
                </form>

                {/* Sidebar Order Review */}
                <div style={{
                  borderRadius: '16px', height: 'fit-content', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '24px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.01)'
                }}>
                  <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '16px', color: '#0f172a', fontWeight: 800 }}>
                    Order Summary
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', maxHeight: '180px', overflowY: 'auto', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                    {cartItems.map((item, idx) => (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569' }} key={`${item.id || item._id}-${idx}`}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{item.name} <strong style={{ color: '#0f172a' }}>× {item.quantity}</strong></span>
                          {(item.selectedFlavour || item.flavour) && (
                            <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 800 }}>
                              Flavour: {item.selectedFlavour || item.flavour}
                            </span>
                          )}
                        </div>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '8px' }}>
                    <span>Subtotal</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{formatPrice(priceDetails.subtotal)}</span>
                  </div>
                  {priceDetails.discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#22c55e', marginBottom: '8px', fontWeight: 600 }}>
                      <span>Discount ({priceDetails.appliedPromo?.code})</span>
                      <span>-₹{formatPrice(priceDetails.discountAmount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '14px' }}>
                    <span>Delivery Charges</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{priceDetails.deliveryCharges === 0 ? 'FREE' : `₹${formatPrice(priceDetails.deliveryCharges)}`}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 900, color: '#d97706', paddingTop: '12px', borderTop: '1px solid #cbd5e1' }}>
                    <span>Grand Total</span>
                    <span>₹{formatPrice(priceDetails.finalTotal)}/-</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
